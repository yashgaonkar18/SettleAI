from typing import Dict, Any, Optional
from app.database import supabase_admin
from app.services.invoice_service import InvoiceService

class PaymentService:
    @classmethod
    async def record_payment(
        cls,
        invoice_id: Optional[str],
        user_id: str,
        paypal_order_id: str,
        amount: float,
        status: str = "COMPLETED",
        paypal_capture_id: Optional[str] = None,
        payer_email: Optional[str] = None,
        payer_name: Optional[str] = None,
        raw_payload: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        payload = {
            "invoice_id": invoice_id,
            "user_id": user_id,
            "paypal_order_id": paypal_order_id,
            "paypal_capture_id": paypal_capture_id,
            "amount": amount,
            "currency": "USD",
            "status": status,
            "payer_email": payer_email,
            "payer_name": payer_name,
            "raw_payload": raw_payload,
        }

        if supabase_admin:
            try:
                res = supabase_admin.from_("payments").insert(payload).execute()
                if status == "COMPLETED" and invoice_id:
                    await InvoiceService.update_invoice_status(invoice_id, "paid", amount)
                    supabase_admin.from_("reminders").update({"status": "dismissed"}).eq("invoice_id", invoice_id).eq("status", "pending_approval").execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                print(f"Supabase record_payment notice: {e}")

        if status == "COMPLETED" and invoice_id:
            await InvoiceService.update_invoice_status(invoice_id, "paid", amount)

        return payload

    @classmethod
    async def handle_webhook_event(cls, event: Dict[str, Any]) -> Dict[str, Any]:
        event_type = event.get("event_type")
        resource = event.get("resource", {})

        print(f"[PayPal Webhook Python] Received event: {event_type}")

        if event_type in ["PAYMENT.CAPTURE.COMPLETED", "CHECKOUT.ORDER.APPROVED"]:
            order_id = (
                resource.get("supplementary_data", {}).get("related_ids", {}).get("order_id")
                or resource.get("id")
            )
            capture_id = resource.get("id")
            amount = float(resource.get("amount", {}).get("value", 0.0))
            payer_email = resource.get("payer", {}).get("email_address")

            # Look up invoice by paypal_order_id
            if supabase_admin and order_id:
                try:
                    res = supabase_admin.from_("invoices").select("id, user_id, amount").eq("paypal_order_id", order_id).maybe_single().execute()
                    if res and res.data:
                        inv = res.data
                        await cls.record_payment(
                            invoice_id=inv["id"],
                            user_id=inv["user_id"],
                            paypal_order_id=order_id,
                            paypal_capture_id=capture_id,
                            amount=amount or float(inv["amount"]),
                            status="COMPLETED",
                            payer_email=payer_email,
                            raw_payload=event,
                        )
                        print(f"[PayPal Webhook] Settled invoice {inv['id']}")
                except Exception as e:
                    print(f"Supabase webhook match error: {e}")

        return {"received": True}
