import base64
import time
from typing import Dict, Any, Optional
import httpx
from app.config import settings

class PayPalService:
    _cached_token: Optional[str] = None
    _token_expires_at: float = 0.0

    @classmethod
    async def get_access_token(cls) -> str:
        if not settings.PAYPAL_CLIENT_ID or not settings.PAYPAL_CLIENT_SECRET:
            raise ValueError("PayPal Client ID and Secret are not configured in settings.")

        if cls._cached_token and time.time() < cls._token_expires_at:
            return cls._cached_token

        auth_header = base64.b64encode(
            f"{settings.PAYPAL_CLIENT_ID}:{settings.PAYPAL_CLIENT_SECRET}".encode()
        ).decode()

        async with httpx.AsyncClient(timeout=30.0) as client:
            res = await client.post(
                f"{settings.PAYPAL_BASE_URL}/v1/oauth2/token",
                headers={
                    "Authorization": f"Basic {auth_header}",
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                data={"grant_type": "client_credentials"},
            )
            res.raise_for_status()
            data = res.json()
            cls._cached_token = data["access_token"]
            cls._token_expires_at = time.time() + data.get("expires_in", 3600) - 60
            return cls._cached_token

    @classmethod
    async def create_order(
        cls,
        invoice_number: str,
        amount: float,
        currency: str = "USD",
        description: Optional[str] = None,
        client_email: Optional[str] = None,
    ) -> Dict[str, str]:
        token = await cls.get_access_token()
        payload = {
            "intent": "CAPTURE",
            "purchase_units": [
                {
                    "reference_id": invoice_number,
                    "description": description or f"Invoice #{invoice_number}",
                    "amount": {
                        "currency_code": currency,
                        "value": f"{amount:.2f}",
                    },
                }
            ],
            "application_context": {
                "brand_name": "SettleAI",
                "landing_page": "BILLING",
                "user_action": "PAY_NOW",
                "return_url": "http://localhost:3000/dashboard?payment=success",
                "cancel_url": "http://localhost:3000/dashboard?payment=cancelled",
            },
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            res = await client.post(
                f"{settings.PAYPAL_BASE_URL}/v2/checkout/orders",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json",
                },
                json=payload,
            )
            res.raise_for_status()
            data = res.json()
            approval_link = next(
                (l["href"] for l in data.get("links", []) if l.get("rel") == "approve"),
                f"https://sandbox.paypal.com/checkout?token={data['id']}",
            )
            return {
                "orderId": data["id"],
                "approvalLink": approval_link,
            }

    @classmethod
    async def capture_order(cls, order_id: str) -> Dict[str, Any]:
        token = await cls.get_access_token()
        async with httpx.AsyncClient(timeout=30.0) as client:
            res = await client.post(
                f"{settings.PAYPAL_BASE_URL}/v2/checkout/orders/{order_id}/capture",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json",
                },
            )
            res.raise_for_status()
            return res.json()

    @classmethod
    async def create_invoice(
        cls,
        invoice_number: str,
        amount: float,
        client_email: str,
        client_name: Optional[str] = None,
        due_date: Optional[str] = None,
        notes: Optional[str] = None,
        line_items: Optional[list] = None,
        currency: str = "USD",
        send_to_recipient: bool = False,
    ) -> Dict[str, Any]:
        """
        Creates a PayPal invoice using the PayPal Invoicing API v2 (/v2/invoicing/invoices).
        If send_to_recipient is True, PayPal immediately sends the invoice email to client_email.
        If send_to_recipient is False, it remains as DRAFT in PayPal.
        """
        web_base = "https://www.paypal.com" if "sandbox" not in settings.PAYPAL_BASE_URL else "https://www.sandbox.paypal.com"
        token = await cls.get_access_token()

        # Recipient name formatting
        name_parts = (client_name or "").strip().split(" ", 1)
        given_name = name_parts[0] if name_parts[0] else "Client"
        surname = name_parts[1] if len(name_parts) > 1 else ""

        # Items payload
        items = []
        if line_items and len(line_items) > 0:
            for it in line_items:
                desc = it.get("description") or "Service"
                qty = float(it.get("quantity") or 1)
                rate = float(it.get("rate") or 0)
                items.append({
                    "name": desc[:300],
                    "quantity": f"{qty:g}",
                    "unit_amount": {
                        "currency_code": currency,
                        "value": f"{rate:.2f}"
                    }
                })
        else:
            items.append({
                "name": "Invoice Services",
                "quantity": "1",
                "unit_amount": {
                    "currency_code": currency,
                    "value": f"{amount:.2f}"
                }
            })

        detail_payload: Dict[str, Any] = {
            "currency_code": currency,
            "note": notes or "Thank you for your business!",
        }
        if due_date:
            detail_payload["payment_term"] = {
                "term_type": "DUE_ON_DATE_SPECIFIED",
                "due_date": due_date
            }
        else:
            detail_payload["payment_term"] = {
                "term_type": "NO_DUE_DATE"
            }

        if invoice_number:
            detail_payload["invoice_number"] = invoice_number

        billing_info: Dict[str, Any] = {
            "name": {"given_name": given_name},
            "email_address": client_email,
        }
        if surname:
            billing_info["name"]["surname"] = surname

        payload = {
            "detail": detail_payload,
            "invoicer": {
                "name": {
                    "given_name": "SettleAI",
                    "surname": "Billing"
                }
            },
            "primary_recipients": [
                {
                    "billing_info": billing_info
                }
            ],
            "items": items,
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            res = await client.post(
                f"{settings.PAYPAL_BASE_URL}/v2/invoicing/invoices",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json",
                },
                json=payload,
            )

            # Retry without invoice_number if PayPal reports duplicate invoice number
            if res.status_code == 422 and "DUPLICATE_INVOICE_NUMBER" in res.text:
                payload["detail"].pop("invoice_number", None)
                res = await client.post(
                    f"{settings.PAYPAL_BASE_URL}/v2/invoicing/invoices",
                    headers={
                        "Authorization": f"Bearer {token}",
                        "Content-Type": "application/json",
                    },
                    json=payload,
                )

            res.raise_for_status()
            data = res.json()
            href = data.get("href", "")
            invoice_id = href.split("/")[-1]

            payment_link = f"{web_base}/invoice/p/#{invoice_id}"

            if send_to_recipient:
                send_res = await client.post(
                    f"{settings.PAYPAL_BASE_URL}/v2/invoicing/invoices/{invoice_id}/send",
                    headers={
                        "Authorization": f"Bearer {token}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "send_to_recipient": True,
                        "send_to_invoicer": True,
                    },
                )
                if send_res.status_code == 200:
                    send_data = send_res.json()
                    payment_link = send_data.get("href", payment_link)
                else:
                    print(f"PayPal send invoice warning: {send_res.status_code} {send_res.text}")

            return {
                "invoiceId": invoice_id,
                "paymentLink": payment_link,
                "status": "SENT" if send_to_recipient else "DRAFT",
            }

    @classmethod
    async def send_invoice(cls, invoice_id: str) -> Dict[str, Any]:
        """
        Sends an existing PayPal draft invoice to the client recipient via email.
        """
        web_base = "https://www.paypal.com" if "sandbox" not in settings.PAYPAL_BASE_URL else "https://www.sandbox.paypal.com"
        fallback_link = f"{web_base}/invoice/p/#{invoice_id}"

        token = await cls.get_access_token()
        async with httpx.AsyncClient(timeout=30.0) as client:
            send_res = await client.post(
                f"{settings.PAYPAL_BASE_URL}/v2/invoicing/invoices/{invoice_id}/send",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json",
                },
                json={
                    "send_to_recipient": True,
                    "send_to_invoicer": True,
                },
            )
            send_res.raise_for_status()
            send_data = send_res.json()
            payment_link = send_data.get("href", fallback_link)
            return {
                "invoiceId": invoice_id,
                "paymentLink": payment_link,
                "status": "SENT",
            }
