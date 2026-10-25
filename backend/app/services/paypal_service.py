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
        is_mock = (
            not settings.PAYPAL_CLIENT_ID
            or settings.PAYPAL_CLIENT_ID == "your_sandbox_client_id"
            or not settings.PAYPAL_CLIENT_SECRET
            or settings.PAYPAL_CLIENT_SECRET == "your_sandbox_client_secret"
        )
        if is_mock:
            return "mock_paypal_token"

        if cls._cached_token and time.time() < cls._token_expires_at:
            return cls._cached_token

        auth_header = base64.b64encode(
            f"{settings.PAYPAL_CLIENT_ID}:{settings.PAYPAL_CLIENT_SECRET}".encode()
        ).decode()

        async with httpx.AsyncClient() as client:
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
        is_mock = (
            not settings.PAYPAL_CLIENT_ID
            or settings.PAYPAL_CLIENT_ID == "your_sandbox_client_id"
        )
        if is_mock:
            order_id = f"ORD-{int(time.time() * 1000)}"
            return {
                "orderId": order_id,
                "approvalLink": f"https://sandbox.paypal.com/checkout?token={order_id}",
            }

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

        async with httpx.AsyncClient() as client:
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
        if order_id.startswith("ORD-"):
            return {
                "id": f"CAP-{int(time.time())}",
                "status": "COMPLETED",
                "order_id": order_id,
                "amount": {"value": "100.00", "currency_code": "USD"},
            }

        token = await cls.get_access_token()
        async with httpx.AsyncClient() as client:
            res = await client.post(
                f"{settings.PAYPAL_BASE_URL}/v2/checkout/orders/{order_id}/capture",
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json",
                },
            )
            res.raise_for_status()
            return res.json()
