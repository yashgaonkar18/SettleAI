from typing import Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Body
from app.services.paypal_service import PayPalService
from app.services.payment_service import PaymentService
from app.services.invoice_service import InvoiceService

router = APIRouter(prefix="/api/payments", tags=["Payments"])

@router.post("/create-order")
async def create_paypal_order(payload: Dict[str, Any] = Body(...)):
    invoice_id = payload.get("invoiceId")
    if not invoice_id:
        raise HTTPException(status_code=400, detail="invoiceId is required")

    try:
        invoice = await InvoiceService.get_invoice_by_id(invoice_id)
        pp_order = await PayPalService.create_order(
            invoice_number=invoice.get("invoiceNumber") or invoice.get("invoice_number"),
            amount=float(invoice.get("amount", 0.0)),
            client_email=invoice.get("clientEmail") or invoice.get("client_email"),
        )
        return {"success": True, **pp_order}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/capture-order")
async def capture_paypal_order(payload: Dict[str, Any] = Body(...)):
    order_id = payload.get("orderId")
    invoice_id = payload.get("invoiceId")
    user_id = payload.get("userId", "user-default")

    if not order_id:
        raise HTTPException(status_code=400, detail="orderId is required")

    try:
        capture_data = await PayPalService.capture_order(order_id)
        payment = await PaymentService.record_payment(
            invoice_id=invoice_id,
            user_id=user_id,
            paypal_order_id=order_id,
            paypal_capture_id=capture_data.get("id"),
            amount=float(capture_data.get("amount", {}).get("value", 0.0)),
            status="COMPLETED",
            raw_payload=capture_data,
        )
        return {
            "success": True,
            "message": "Payment captured successfully and invoice settled",
            "capture": capture_data,
            "payment": payment,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/webhook")
async def paypal_webhook(payload: Dict[str, Any] = Body(...)):
    try:
        result = await PaymentService.handle_webhook_event(payload)
        return {"success": True, "result": result}
    except Exception as e:
        print(f"Webhook processing error: {e}")
        return {"success": False, "error": str(e)}
