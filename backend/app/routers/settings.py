from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from app.schemas.settings import UserSettingsSchema
from app.services.profile_service import ProfileService

router = APIRouter(prefix="/api/settings", tags=["Settings"])

@router.get("")
async def get_settings(userId: Optional[str] = Query("user-default")):
    try:
        settings = await ProfileService.get_settings(userId)
        return {"success": True, "settings": settings}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("")
@router.post("")
async def update_settings(payload: UserSettingsSchema):
    try:
        updated = await ProfileService.update_settings(payload, payload.userId)
        return {
            "success": True,
            "message": "Settings saved successfully to database",
            "settings": updated,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
