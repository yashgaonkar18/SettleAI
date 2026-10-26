import time
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from app.database import supabase_admin
from app.services.gemini_service import GeminiService
from app.services.invoice_service import InvoiceService, resolve_user_id, is_valid_uuid

class ReminderService:
    @classmethod
    async def get_reminders(cls, user_id: Optional[str] = None, status: Optional[str] = None) -> List[Dict[str, Any]]:
        if not supabase_admin:
            return []

        try:
            query = supabase_admin.from_("reminders").select("*").order("created_at", desc=True)
            if user_id and is_valid_uuid(user_id):
                query = query.eq("user_id", user_id)
            if status:
                query = query.eq("status", status)

            res = query.execute()
            if res.data is not None:
                return [
                    {
                        "id": r["id"],
                        "invoiceId": r["invoice_id"],
                        "clientName": r["client_name"],
                        "clientEmail": r["client_email"],
                        "amount": float(r["amount"]),
                        "daysLate": r["days_late"],
                        "tone": r["tone"],
                        "subject": r["subject"],
                        "message": r["message"],
                        "paymentLink": r.get("payment_link"),
                        "status": r["status"],
                        "sentAt": r.get("sent_at"),
                        "createdAt": r["created_at"],
                    }
                    for r in res.data
                ]
        except Exception as e:
            print(f"Supabase get_reminders error: {e}")

        return []

    @classmethod
    async def generate_reminder_draft(cls, user_id: str, invoice_id: str, tone: str = "friendly") -> Dict[str, Any]:
        invoice = await InvoiceService.get_invoice_by_id(invoice_id)
        if not invoice:
            raise ValueError(f"Invoice {invoice_id} not found to generate reminder")
        target_user_id = resolve_user_id(user_id) or resolve_user_id(invoice.get("userId"))

        today = datetime.now()
        due_str = invoice.get("dueDate") or invoice.get("due_date")
        due_date = datetime.strptime(due_str, "%Y-%m-%d")
        diff_days = max(0, (today - due_date).days)

        selected_tone = tone
        if diff_days >= 15:
            selected_tone = "final"
        elif diff_days >= 6:
            selected_tone = "firm"

        ai_draft = await GeminiService.generate_reminder_draft(
            client_name=invoice.get("clientName") or invoice.get("client_name"),
            invoice_number=invoice.get("invoiceNumber") or invoice.get("invoice_number"),
            amount=float(invoice.get("amount", 0.0)),
            days_late=diff_days,
            tone=selected_tone,
            payment_link=invoice.get("paymentLink") or invoice.get("payment_link") or "https://sandbox.paypal.com/checkout",
        )

        reminder_payload = {
            "user_id": target_user_id,
            "invoice_id": invoice_id,
            "client_name": invoice.get("clientName") or invoice.get("client_name"),
            "client_email": invoice.get("clientEmail") or invoice.get("client_email"),
            "amount": float(invoice.get("amount", 0.0)),
            "days_late": diff_days,
            "tone": selected_tone,
            "subject": ai_draft["subject"],
            "message": ai_draft["message"],
            "payment_link": invoice.get("paymentLink") or invoice.get("payment_link"),
            "status": "pending_approval",
        }

        if supabase_admin and target_user_id:
            res = supabase_admin.from_("reminders").insert(reminder_payload).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]

        raise ValueError("Could not save reminder to database")

    @classmethod
    async def send_reminder(cls, reminder_id: str, user_id: Optional[str] = None) -> Dict[str, Any]:
        now_iso = datetime.now().isoformat()
        if supabase_admin:
            res = supabase_admin.from_("reminders").update({"status": "sent", "sent_at": now_iso}).eq("id", reminder_id).execute()
            if res.data and len(res.data) > 0:
                return res.data[0]

        return {"id": reminder_id, "status": "sent", "sentAt": now_iso}

    @classmethod
    async def dismiss_reminder(cls, reminder_id: str) -> Dict[str, Any]:
        if supabase_admin:
            supabase_admin.from_("reminders").delete().eq("id", reminder_id).execute()

        return {"success": True, "id": reminder_id}
