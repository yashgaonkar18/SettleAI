from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from app.services.invoice_service import InvoiceService
from app.services.reminder_service import ReminderService
from app.services.gemini_service import GeminiService

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/stats")
async def get_dashboard_stats(userId: Optional[str] = Query("user-default")):
    try:
        invoices = await InvoiceService.get_invoices(userId)
        reminders = await ReminderService.get_reminders(userId, "pending_approval")

        received_amount = sum(inv["amount"] for inv in invoices if inv["status"] == "paid")
        expected_amount = sum(inv["amount"] for inv in invoices if inv["status"] == "sent")
        overdue_invoices = [inv for inv in invoices if inv["status"] == "overdue"]
        overdue_amount = sum(inv["amount"] for inv in overdue_invoices)

        top_overdue = sorted(overdue_invoices, key=lambda x: x["amount"], reverse=True)
        top_client = top_overdue[0]["clientName"] if top_overdue else None
        top_amt = top_overdue[0]["amount"] if top_overdue else 0

        insight_text = await GeminiService.generate_cash_flow_insight({
            "received": received_amount,
            "expected": expected_amount,
            "overdue": overdue_amount,
            "overdueInvoicesCount": len(overdue_invoices),
            "topOverdueClient": top_client,
            "topOverdueAmount": top_amt,
        })

        return {
            "success": True,
            "stats": {
                "receivedAmount": received_amount,
                "expectedAmount": expected_amount,
                "overdueAmount": overdue_amount,
                "insightText": insight_text,
                "pendingRemindersCount": len(reminders),
                "invoicesCount": len(invoices),
                "overdueCount": len(overdue_invoices),
            },
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
