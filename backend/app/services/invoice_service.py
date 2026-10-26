import random
import time
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
from app.database import supabase_admin
from app.schemas.invoice import CreateInvoiceSchema
from app.services.paypal_service import PayPalService

def is_valid_uuid(val: Optional[str]) -> bool:
    if not val:
        return False
    try:
        uuid.UUID(str(val))
        return True
    except ValueError:
        return False

def resolve_user_id(val: Optional[str]) -> Optional[str]:
    if is_valid_uuid(val):
        return str(val)
    if supabase_admin:
        try:
            res = supabase_admin.from_("profiles").select("id").limit(1).execute()
            if res.data and len(res.data) > 0:
                return str(res.data[0]["id"])
        except Exception:
            pass
    return None

class InvoiceService:
    @classmethod
    async def get_invoices(cls, user_id: Optional[str] = None, status: Optional[str] = None) -> List[Dict[str, Any]]:
        if not supabase_admin:
            return []

        try:
            query = supabase_admin.from_("invoices").select("*, line_items:invoice_line_items(*)").order("created_at", desc=True)
            if user_id and is_valid_uuid(user_id):
                query = query.eq("user_id", user_id)
            if status:
                query = query.eq("status", status)

            res = query.execute()
            if res.data is not None:
                today = datetime.now()
                formatted = []
                for inv in res.data:
                    due_date = datetime.strptime(inv["due_date"], "%Y-%m-%d")
                    diff_days = (today - due_date).days
                    days_late = max(diff_days, 0) if (inv["status"] == "overdue" or (inv["status"] != "paid" and diff_days > 0)) else None

                    formatted.append({
                        "id": inv["id"],
                        "invoiceNumber": inv["invoice_number"],
                        "clientName": inv["client_name"],
                        "clientEmail": inv["client_email"],
                        "amount": float(inv["amount"]),
                        "paidAmount": float(inv.get("paid_amount") or 0.0),
                        "dueDate": inv["due_date"],
                        "daysLate": days_late,
                        "status": inv["status"],
                        "paypalOrderId": inv.get("paypal_order_id"),
                        "paymentLink": inv.get("payment_link"),
                        "createdAt": inv["created_at"],
                        "lineItems": [
                            {
                                "id": item["id"],
                                "description": item["description"],
                                "quantity": float(item["quantity"]),
                                "rate": float(item["rate"]),
                                "amount": float(item["amount"]),
                            }
                            for item in (inv.get("line_items") or [])
                        ],
                    })
                return formatted
        except Exception as e:
            print(f"Supabase get_invoices error: {e}")

        return []

    @classmethod
    async def get_invoice_by_id(cls, invoice_id: str) -> Dict[str, Any]:
        if not supabase_admin:
            raise ValueError(f"Invoice {invoice_id} not found")

        res = supabase_admin.from_("invoices").select("*, line_items:invoice_line_items(*)").eq("id", invoice_id).single().execute()
        if res.data:
            inv = res.data
            return {
                "id": inv["id"],
                "userId": inv.get("user_id"),
                "invoiceNumber": inv["invoice_number"],
                "clientName": inv["client_name"],
                "clientEmail": inv["client_email"],
                "amount": float(inv["amount"]),
                "paidAmount": float(inv.get("paid_amount") or 0.0),
                "dueDate": inv["due_date"],
                "status": inv["status"],
                "paypalOrderId": inv.get("paypal_order_id"),
                "paymentLink": inv.get("payment_link"),
                "createdAt": inv["created_at"],
                "lineItems": (inv.get("line_items") or []),
            }

        raise ValueError(f"Invoice with ID {invoice_id} not found")

    @classmethod
    async def create_invoice(cls, user_id: str, data: CreateInvoiceSchema) -> Dict[str, Any]:
        target_user_id = resolve_user_id(user_id)
        if not target_user_id:
            raise ValueError("A valid authenticated user ID is required to create an invoice.")
        user_id = target_user_id

        total_amount = data.amount if data.amount is not None else sum(item.quantity * item.rate for item in data.lineItems)
        invoice_number = data.invoiceNumber or f"INV-{datetime.now().year}-{random.randint(100, 999)}"

        try:
            pp = await PayPalService.create_order(
                invoice_number=invoice_number,
                amount=total_amount,
                client_email=data.clientEmail,
                description=f"SettleAI invoice for {data.clientName}",
            )
            order_id = pp["orderId"]
            payment_link = pp["approvalLink"]
        except Exception as pp_err:
            print(f"PayPal order creation fallback: {pp_err}")
            order_id = f"ORD-{int(time.time())}"
            payment_link = f"https://sandbox.paypal.com/checkout?token={order_id}"

        if not supabase_admin:
            raise ValueError("Database connection unavailable.")

        res = supabase_admin.from_("invoices").insert({
            "user_id": user_id,
            "invoice_number": invoice_number,
            "client_name": data.clientName,
            "client_email": data.clientEmail,
            "amount": total_amount,
            "due_date": data.dueDate,
            "notes": data.notes,
            "status": "sent",
            "paypal_order_id": order_id,
            "payment_link": payment_link,
        }).execute()

        if not res.data or len(res.data) == 0:
            raise ValueError("Failed to insert invoice into database.")

        created_inv = res.data[0]

        items_payload = [
            {
                "invoice_id": created_inv["id"],
                "description": it.description,
                "quantity": it.quantity,
                "rate": it.rate,
                "amount": it.amount or (it.quantity * it.rate),
            }
            for it in data.lineItems
        ]
        supabase_admin.from_("invoice_line_items").insert(items_payload).execute()
        created_inv["lineItems"] = items_payload

        return {
            "id": created_inv["id"],
            "invoiceNumber": created_inv["invoice_number"],
            "clientName": created_inv["client_name"],
            "clientEmail": created_inv["client_email"],
            "amount": float(created_inv["amount"]),
            "dueDate": created_inv["due_date"],
            "status": created_inv["status"],
            "paypalOrderId": created_inv.get("paypal_order_id"),
            "paymentLink": created_inv.get("payment_link"),
            "lineItems": items_payload,
            "createdAt": created_inv["created_at"],
        }

    @classmethod
    async def update_invoice_status(cls, invoice_id: str, status: str, paid_amount: Optional[float] = None) -> Dict[str, Any]:
        if supabase_admin:
            try:
                payload = {"status": status}
                if status == "paid" and paid_amount is not None:
                    payload["paid_amount"] = paid_amount
                res = supabase_admin.from_("invoices").update(payload).eq("id", invoice_id).execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                print(f"Supabase update status error: {e}")

        return {"id": invoice_id, "status": status, "updated": True}