import time
from datetime import datetime
from typing import List, Dict, Any, Optional
from app.database import supabase_admin
from app.services.gemini_service import GeminiService
from app.services.invoice_service import InvoiceService

import uuid

def is_valid_uuid(val: Optional[str]) -> bool:
    if not val:
        return False
    try:
        uuid.UUID(str(val))
        return True
    except ValueError:
        return False

class ReminderService:
    @classmethod
    async def get_reminders(cls, user_id: Optional[str] = None, status: str = "pending_approval") -> List[Dict[str, Any]]:
        if supabase_admin:
            try:
                query = supabase_admin.from_("reminders").select("*").order("created_at", desc=True)
                if user_id and is_valid_uuid(user_id):
                    query = query.eq("user_id", user_id)
                if status:
                    query = query.eq("status", status)

                res = query.execute()
                if res.data and len(res.data) > 0:
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
                print(f"Supabase get_reminders notice: {e}")

        return cls._get_mock_reminders()

    @classmethod
    async def generate_reminder_draft(cls, user_id: str, invoice_id: str, tone: str = "friendly") -> Dict[str, Any]:
        invoice = await InvoiceService.get_invoice_by_id(invoice_id)
        if not invoice:
            raise ValueError("Invoice not found")

        today = datetime.now()
        due_str = invoice.get("dueDate") or invoice.get("due_date")
        due_date = datetime.strptime(due_str, "%Y-%m-%d")
        diff_days = max(0, (today - due_date).days)

        # Dynamic tone selection if overdue
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
            "user_id": user_id,
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

        if supabase_admin:
            try:
                res = supabase_admin.from_("reminders").insert(reminder_payload).execute()
                if res.data and len(res.data) > 0:
                    return res.data[0]
            except Exception as e:
                print(f"Supabase create reminder notice: {e}")

        reminder_payload["id"] = f"rem-{int(time.time() * 1000)}"
        reminder_payload["createdAt"] = datetime.now().isoformat()
        return reminder_payload

    @classmethod
    async def send_reminder(cls, reminder_id: str, user_id: Optional[str] = None) -> Dict[str, Any]:
        now_iso = datetime.now().isoformat()
        if supabase_admin:
            try:
                res = supabase_admin.from_("reminders").update({"status": "sent", "sent_at": now_iso}).eq("id", reminder_id).execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                print(f"Supabase send_reminder notice: {e}")

        return {"id": reminder_id, "status": "sent", "sentAt": now_iso}

    @classmethod
    async def dismiss_reminder(cls, reminder_id: str) -> Dict[str, Any]:
        if supabase_admin:
            try:
                supabase_admin.from_("reminders").delete().eq("id", reminder_id).execute()
            except Exception as e:
                print(f"Supabase dismiss_reminder notice: {e}")

        return {"success": True, "id": reminder_id}

    @classmethod
    def _get_mock_reminders(cls) -> List[Dict[str, Any]]:
        return [
            {
                "id": "rem-1",
                "invoiceId": "inv-1",
                "clientName": "Acme Corp",
                "clientEmail": "billing@acme.com",
                "amount": 1200.0,
                "daysLate": 9,
                "tone": "firm",
                "subject": "Action Required: Overdue Invoice INV-2026-001 ($1,200.00)",
                "message": (
                    "Hi Acme Corp team,\n\n"
                    "This is a quick notice that invoice INV-2026-001 for Brand Identity & Design System ($1,200.00) is now 9 days past due. "
                    "To prevent any project pause, please settle via the instant PayPal link below.\n\n"
                    "Thank you for your prompt cooperation."
                ),
                "paymentLink": "https://sandbox.paypal.com/checkout/ord_acme1200",
                "status": "pending_approval",
            },
            {
                "id": "rem-2",
                "invoiceId": "inv-2",
                "clientName": "Nova Studio",
                "clientEmail": "payments@novastudio.design",
                "amount": 270.0,
                "daysLate": 4,
                "tone": "friendly",
                "subject": "Friendly Reminder: Invoice INV-2026-002 ($270.00)",
                "message": (
                    "Hi Nova Studio,\n\n"
                    "Hope your week is going great! Just following up on invoice INV-2026-002 ($270.00) for our recent design consultation session. "
                    "You can conveniently pay in seconds using PayPal Orders v2.\n\n"
                    "Let me know if you need any adjustments!"
                ),
                "paymentLink": "https://sandbox.paypal.com/checkout/ord_nova270",
                "status": "pending_approval",
            },
        ]
