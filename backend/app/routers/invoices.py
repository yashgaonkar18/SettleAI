from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status
from app.schemas.invoice import CreateInvoiceSchema, UpdateInvoiceSchema, UpdateStatusSchema, PromptInvoiceSchema
from app.services.invoice_service import InvoiceService
from app.services.gemini_service import GeminiService

router = APIRouter(prefix="/api/invoices", tags=["Invoices"])

@router.get("")
async def list_invoices(
    userId: Optional[str] = Query(""),
    status: Optional[str] = Query(None)
):
    try:
        invoices = await InvoiceService.get_invoices(userId, status)
        return {"success": True, "count": len(invoices), "invoices": invoices}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_invoice(payload: CreateInvoiceSchema):
    try:
        invoice = await InvoiceService.create_invoice(payload.userId or "user-default", payload)
        return {
            "success": True,
            "message": "Invoice created successfully with PayPal Orders v2 checkout link",
            "invoice": invoice,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/prompt")
async def parse_prompt(payload: PromptInvoiceSchema):
    try:
        parsed = await GeminiService.parse_invoice_prompt(payload.prompt)
        return {"success": True, "parsedInvoice": parsed}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{invoice_id}")
async def get_invoice(invoice_id: str):
    try:
        invoice = await InvoiceService.get_invoice_by_id(invoice_id)
        return {"success": True, "invoice": invoice}
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.patch("/{invoice_id}/status")
async def update_status(invoice_id: str, payload: UpdateStatusSchema):
    try:
        updated = await InvoiceService.update_invoice_status(invoice_id, payload.status, payload.paidAmount)
        return {"success": True, "message": f"Invoice marked as {payload.status}", "invoice": updated}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{invoice_id}")
async def update_invoice(invoice_id: str, payload: UpdateInvoiceSchema):
    try:
        updated = await InvoiceService.update_invoice(invoice_id, payload)
        return {"success": True, "message": "Invoice updated successfully", "invoice": updated}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{invoice_id}")
async def delete_invoice(invoice_id: str):
    try:
        await InvoiceService.delete_invoice(invoice_id)
        return {"success": True, "message": "Invoice deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

