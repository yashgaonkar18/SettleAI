from typing import Optional
from fastapi import APIRouter, HTTPException, Query, status
from app.schemas.invoice import GenerateReminderSchema
from app.services.reminder_service import ReminderService

router = APIRouter(prefix="/api/reminders", tags=["Reminders"])

@router.get("")
async def list_reminders(
    userId: Optional[str] = Query("user-default"),
    status: Optional[str] = Query("pending_approval")
):
    try:
        reminders = await ReminderService.get_reminders(userId, status)
        return {"success": True, "count": len(reminders), "reminders": reminders}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate", status_code=status.HTTP_201_CREATED)
async def generate_reminder(payload: GenerateReminderSchema):
    try:
        reminder = await ReminderService.generate_reminder_draft(
            user_id=payload.userId or "user-default",
            invoice_id=payload.invoiceId,
            tone=payload.tone,
        )
        return {
            "success": True,
            "message": "AI reminder draft generated successfully",
            "reminder": reminder,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{reminder_id}/send")
async def send_reminder(reminder_id: str, userId: Optional[str] = "user-default"):
    try:
        result = await ReminderService.send_reminder(reminder_id, userId)
        return {
            "success": True,
            "message": "Reminder dispatched successfully via PayPal and notification channels",
            "reminder": result,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{reminder_id}")
async def dismiss_reminder(reminder_id: str):
    try:
        result = await ReminderService.dismiss_reminder(reminder_id)
        return {"success": True, "message": "Reminder dismissed", "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
