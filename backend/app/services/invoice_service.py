import random
import time
from datetime import datetime
from typing import List, Dict, Any, Optional
from app.database import supabase_admin
from app.schemas.invoice import CreateInvoiceSchema
from app.services.paypal_service import PayPalService

import uuid

def is_valid_uuid(val: Optional[str]) -> bool:
    if not val:
        return False
    try:
        uuid.UUID(str(val))
        return True
    except ValueError:
        return False

class InvoiceService:
    @classmethod
    async def get_invoices(cls, user_id: Optional[str] = None, status: Optional[str] = None) -> List[Dict[str, Any]]:
        if supabase_admin:
            try:
                query = supabase_admin.from_("invoices").select("*, line_items:invoice_line_items(*)").order("created_at", desc=True)
                if user_id and is_valid_uuid(user_id):
                    query = query.eq("user_id", user_id)
                if status:
                    query = query.eq("status", status)

                res = query.execute()
                if res.data and len(res.data) > 0:
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
                print(f"Supabase get_invoices notice: {e}")

        return cls._get_mock_invoices()

    @classmethod
    async def get_invoice_by_id(cls, invoice_id: str) -> Dict[str, Any]:
        if supabase_admin:
            try:
                res = supabase_admin.from_("invoices").select("*, line_items:invoice_line_items(*)").eq("id", invoice_id).single().execute()
                if res.data:
                    return res.data
            except Exception as e:
                print(f"Supabase get_invoice_by_id notice: {e}")

        for inv in cls._get_mock_invoices():
            if inv["id"] == invoice_id:
                return inv
        raise ValueError(f"Invoice with ID {invoice_id} not found")

    @classmethod
    async def create_invoice(cls, user_id: str, data: CreateInvoiceSchema) -> Dict[str, Any]:
        # 1. Total amount calculation
        total_amount = data.amount if data.amount is not None else sum(item.quantity * item.rate for item in data.lineItems)

        # 2. Invoice number
        invoice_number = data.invoiceNumber or f"INV-2026-{random.randint(100, 999)}"

        # 3. Create PayPal checkout link
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

        # 4. Save to Supabase
        if supabase_admin:
            try:
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

                if res.data and len(res.data) > 0:
                    created_inv = res.data[0]
                    # Insert line items
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
                    return created_inv
            except Exception as db_err:
                print(f"Supabase create_invoice notice: {db_err}")

        # Fallback local response
        return {
            "id": f"inv-{int(time.time() * 1000)}",
            "invoiceNumber": invoice_number,
            "clientName": data.clientName,
            "clientEmail": data.clientEmail,
            "amount": total_amount,
            "dueDate": data.dueDate,
            "status": "sent",
            "paypalOrderId": order_id,
            "paymentLink": payment_link,
            "lineItems": [it.model_dump() for it in data.lineItems],
            "createdAt": datetime.now().isoformat(),
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
                print(f"Supabase update status notice: {e}")

        return {"id": invoice_id, "status": status, "updated": True}

    @classmethod
    def _get_mock_invoices(cls) -> List[Dict[str, Any]]:
        return [
            {
                "id": "inv-1",
                "invoiceNumber": "INV-2026-001",
                "clientName": "Acme Corp",
                "clientEmail": "billing@acme.com",
                "amount": 1200.0,
                "dueDate": "2026-10-14",
                "daysLate": 9,
                "status": "overdue",
                "lineItems": [{"id": "l1", "description": "Brand Identity & Design System", "quantity": 1, "rate": 1200, "amount": 1200}],
                "paymentLink": "https://sandbox.paypal.com/checkout/ord_acme1200",
                "createdAt": "2026-09-30",
            },
            {
                "id": "inv-2",
                "invoiceNumber": "INV-2026-002",
                "clientName": "Nova Studio",
                "clientEmail": "payments@novastudio.design",
                "amount": 270.0,
                "dueDate": "2026-10-19",
                "daysLate": 4,
                "status": "overdue",
                "lineItems": [{"id": "l2", "description": "Design Consultation (3 hrs)", "quantity": 3, "rate": 90, "amount": 270}],
                "paymentLink": "https://sandbox.paypal.com/checkout/ord_nova270",
                "createdAt": "2026-10-05",
            },
            {
                "id": "inv-3",
                "invoiceNumber": "INV-2026-003",
                "clientName": "Pixel Craft",
                "clientEmail": "finance@pixelcraft.co",
                "amount": 2400.0,
                "dueDate": "2026-10-28",
                "status": "sent",
                "lineItems": [{"id": "l3", "description": "Fullstack Dashboard UI sprint", "quantity": 1, "rate": 2400, "amount": 2400}],
                "paymentLink": "https://sandbox.paypal.com/checkout/ord_pixel2400",
                "createdAt": "2026-10-14",
            },
            {
                "id": "inv-4",
                "invoiceNumber": "INV-2026-004",
                "clientName": "Stripe Devs",
                "clientEmail": "ops@stripedevs.com",
                "amount": 1800.0,
                "dueDate": "2026-11-04",
                "status": "sent",
                "lineItems": [{"id": "l4", "description": "Webhooks Integration Architecture", "quantity": 1, "rate": 1800, "amount": 1800}],
                "paymentLink": "https://sandbox.paypal.com/checkout/ord_stripe1800",
                "createdAt": "2026-10-20",
            },
            {
                "id": "inv-5",
                "invoiceNumber": "INV-2026-005",
                "clientName": "Apex Labs",
                "clientEmail": "accounts@apexlabs.ai",
                "amount": 4950.0,
                "dueDate": "2026-10-21",
                "status": "paid",
                "lineItems": [{"id": "l5", "description": "Gemini Model Fine-Tuning Pipeline", "quantity": 1, "rate": 4950, "amount": 4950}],
                "paymentLink": "https://sandbox.paypal.com/checkout/ord_apex4950",
                "createdAt": "2026-10-07",
            },
            {
                "id": "inv-6",
                "invoiceNumber": "INV-2026-006",
                "clientName": "Horizon Media",
                "clientEmail": "billing@horizonmedia.io",
                "amount": 3500.0,
                "dueDate": "2026-10-15",
                "status": "paid",
                "lineItems": [{"id": "l6", "description": "Monthly Growth Retainer", "quantity": 1, "rate": 3500, "amount": 3500}],
                "paymentLink": "https://sandbox.paypal.com/checkout/ord_horizon3500",
                "createdAt": "2026-10-01",
            },
        ]
