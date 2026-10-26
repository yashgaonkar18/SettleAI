import asyncio
import json
import re
from datetime import datetime, timedelta
from typing import Dict, Any
from app.config import settings


class GeminiService:
    @classmethod
    def _get_client(cls):
        try:
            from google import genai
            if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your_gemini_api_key":
                return genai.Client(api_key=settings.GEMINI_API_KEY)
        except Exception as e:
            print(f"Gemini client init warning: {e}")
        return None

    @classmethod
    async def parse_invoice_prompt(cls, prompt: str) -> Dict[str, Any]:
        client = cls._get_client()
        if not client:
            return cls._mock_parsed_invoice(prompt)

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

        try:
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
        except Exception as err:
            print(f"Gemini parse_invoice_prompt error: {err}")
            return cls._mock_parsed_invoice(prompt)

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
        if not client:
            return cls._mock_reminder_draft(client_name, invoice_number, amount, days_late, tone, payment_link)

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

        try:
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
        except Exception as err:
            print(f"Gemini generate_reminder_draft error: {err}")
            return cls._mock_reminder_draft(client_name, invoice_number, amount, days_late, tone, payment_link)

    @classmethod
    def _mock_parsed_invoice(cls, prompt: str) -> Dict[str, Any]:
        amount_match = re.search(r"\$?(\d+(?:,\d{3})*(?:\.\d{2})?)", prompt)
        amount = float(amount_match.group(1).replace(",", "")) if amount_match else 1200.0

        client = "Acme Corp"
        if "nova" in prompt.lower():
            client = "Nova Studio"
        elif "stripe" in prompt.lower():
            client = "Stripe Devs"
        elif "pixel" in prompt.lower():
            client = "Pixel Craft"

        due_date = (datetime.now() + timedelta(days=14)).strftime("%Y-%m-%d")

        return {
            "clientName": client,
            "clientEmail": f"billing@{client.lower().replace(' ', '')}.com",
            "amount": amount,
            "dueDate": due_date,
            "notes": f'Generated from prompt: "{prompt}"',
            "lineItems": [
                {
                    "description": prompt[:50] + "..." if len(prompt) > 50 else prompt,
                    "quantity": 1,
                    "rate": amount,
                    "amount": amount,
                }
            ],
        }

    @classmethod
    def _mock_reminder_draft(
        cls,
        client_name: str,
        invoice_number: str,
        amount: float,
        days_late: int,
        tone: str,
        payment_link: str,
    ) -> Dict[str, str]:
        if tone == "friendly":
            return {
                "subject": f"Friendly Reminder: Invoice {invoice_number} (${amount:,.2f})",
                "message": (
                    f"Hi {client_name},\n\n"
                    f"Hope your week is going great! Just following up on invoice {invoice_number} (${amount:,.2f}). "
                    f"You can conveniently settle in seconds using the PayPal link below:\n\n{payment_link}\n\n"
                    f"Let us know if you have any questions!"
                ),
            }
        elif tone == "final":
            return {
                "subject": f"URGENT / FINAL NOTICE: Overdue Invoice {invoice_number} (${amount:,.2f})",
                "message": (
                    f"Dear {client_name},\n\n"
                    f"Invoice {invoice_number} for ${amount:,.2f} is now {days_late} days past due. "
                    f"Immediate payment is required to avoid project suspension:\n\n{payment_link}\n\n"
                    f"Please settle today."
                ),
            }
        return {
            "subject": f"Action Required: Overdue Invoice {invoice_number} (${amount:,.2f})",
            "message": (
                f"Hello {client_name},\n\n"
                f"This is a quick notice that invoice {invoice_number} (${amount:,.2f}) is now {days_late} days past due. "
                f"Please settle via the PayPal link below:\n\n{payment_link}\n\nThank you for your prompt cooperation."
            ),
        }