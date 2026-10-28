import asyncio
import json
from datetime import datetime, timedelta
from typing import Dict, Any
from app.config import settings

class GeminiService:
    @classmethod
    def _get_client(cls):
        from google import genai
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not configured in settings.")
        return genai.Client(api_key=settings.GEMINI_API_KEY)

    @classmethod
    async def parse_invoice_prompt(cls, prompt: str) -> Dict[str, Any]:
        client = cls._get_client()

        today_str = datetime.now().strftime("%Y-%m-%d")
        system_instruction = (
            f"You are an AI billing assistant for SettleAI.\n"
            f"Analyze the user's natural language request to create an invoice.\n"
            f"Today's date is: {today_str}.\n"
            f"Extract the following fields and respond ONLY with valid JSON:\n"
            f"{{\n"
            f'  "clientName": string,\n'
            f'  "clientEmail": string,\n'
            f'  "amount": number,\n'
            f'  "dueDate": string (YYYY-MM-DD format, default to 14 days from today),\n'
            f'  "notes": string,\n'
            f'  "lineItems": [{{"description": string, "quantity": number, "rate": number, "amount": number}}]\n'
            f"}}"
        )

        response = await asyncio.to_thread(
            client.models.generate_content,
            model=settings.GEMINI_MODEL,
            contents=f"{system_instruction}\n\nUser request: \"{prompt}\"",
            config={"response_mime_type": "application/json"},
        )
        data = json.loads(response.text or "{}")

        amount = float(data.get("amount", 0.0))
        line_items = data.get("lineItems") or [
            {"description": "Professional Services", "quantity": 1, "rate": amount, "amount": amount}
        ]

        return {
            "clientName": data.get("clientName", "Client"),
            "clientEmail": data.get("clientEmail", "billing@client.com"),
            "amount": amount,
            "dueDate": data.get("dueDate", (datetime.now() + timedelta(days=14)).strftime("%Y-%m-%d")),
            "notes": data.get("notes", f'Generated from prompt: "{prompt}"'),
            "lineItems": line_items,
        }

    @classmethod
    async def generate_reminder_draft(
        cls,
        client_name: str,
        invoice_number: str,
        amount: float,
        days_late: int,
        tone: str = "friendly",
        payment_link: str = "https://sandbox.paypal.com/checkout",
    ) -> Dict[str, str]:
        client = cls._get_client()

        prompt = (
            f"You are an AI receivables manager for SettleAI.\n"
            f"Draft a professional email reminder for an overdue invoice with tone: \"{tone.upper()}\".\n"
            f"Details:\n"
            f"- Client: {client_name}\n"
            f"- Invoice #: {invoice_number}\n"
            f"- Amount: ${amount:,.2f}\n"
            f"- Days Overdue: {days_late} days\n"
            f"- PayPal Instant Payment Link: {payment_link}\n"
            f"Return JSON strictly with 'subject' and 'message' keys."
        )

        response = await asyncio.to_thread(
            client.models.generate_content,
            model=settings.GEMINI_MODEL,
            contents=prompt,
            config={"response_mime_type": "application/json"},
        )
        data = json.loads(response.text or "{}")
        return {
            "subject": data.get("subject", f"Payment Reminder: Invoice {invoice_number} (${amount:,.2f})"),
            "message": data.get("message", f"Hi {client_name},\n\nPlease settle invoice {invoice_number} via: {payment_link}"),
        }

    @classmethod
    async def generate_cash_flow_insight(cls, data: Dict[str, Any]) -> str:
        overdue = data.get("overdue", 0)
        expected = data.get("expected", 0)
        try:
            client = cls._get_client()
            prompt = (
                f"You are a financial advisor for SettleAI. Generate a concise 1-2 sentence cash flow insight summary for the user's dashboard based on these numbers:\n"
                f"- Total Received: ${data.get('received', 0):,.2f}\n"
                f"- Expected / Sent: ${expected:,.2f}\n"
                f"- Overdue: ${overdue:,.2f}\n"
                f"- Overdue Invoices Count: {data.get('overdueInvoicesCount', 0)}\n"
                f"- Top Overdue Client: {data.get('topOverdueClient') or 'None'} (${data.get('topOverdueAmount', 0):,.2f})\n"
                f"Provide only plain text summary insight, no quotes or markdown headers."
            )
            response = await asyncio.wait_for(
                asyncio.to_thread(
                    client.models.generate_content,
                    model=settings.GEMINI_MODEL,
                    contents=prompt,
                ),
                timeout=5.0,
            )
            return response.text.strip()
        except Exception as e:
            print(f"Gemini cash flow insight notice: {e}")
            if overdue > 0:
                return f"${overdue:,.2f} is currently overdue across {data.get('overdueInvoicesCount', 0)} invoices. Follow up to keep cash flow healthy."
            return f"${expected:,.2f} expected in upcoming payments. All current invoices are on schedule."
