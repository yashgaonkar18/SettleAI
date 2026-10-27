from typing import Dict, Any, Optional
from app.database import supabase_admin
from app.services.invoice_service import resolve_user_id
from app.schemas.settings import UserSettingsSchema

DEFAULT_SETTINGS = {
    "fullName": "Yash",
    "email": "",
    "businessName": "My Business",
    "currency": "USD",
    "paymentTerms": "net-30",
    "reminderTone": "friendly",
    "firstReminder": "1",
    "repeatReminder": "7",
    "emailNotifications": True,
    "overdueAlerts": True,
    "paymentNotifications": True,
    "weeklySummary": False,
    "theme": "light",
}

class ProfileService:
    @classmethod
    async def get_settings(cls, user_id: Optional[str] = None) -> Dict[str, Any]:
        target_uid = resolve_user_id(user_id)
        if not target_uid or not supabase_admin:
            return DEFAULT_SETTINGS

        settings_dict = dict(DEFAULT_SETTINGS)

        try:
            # 1. Fetch public.profiles
            prof_res = supabase_admin.from_("profiles").select("*").eq("id", target_uid).single().execute()
            if prof_res.data:
                p = prof_res.data
                if p.get("full_name"):
                    settings_dict["fullName"] = p["full_name"]
                if p.get("email"):
                    settings_dict["email"] = p["email"]
                if p.get("business_name"):
                    settings_dict["businessName"] = p["business_name"]
                if p.get("currency"):
                    settings_dict["currency"] = p["currency"]

            # 2. Fetch auth user_metadata for preferences
            try:
                auth_user = supabase_admin.auth.admin.get_user_by_id(target_uid)
                if auth_user and auth_user.user:
                    u = auth_user.user
                    if not settings_dict.get("email") and u.email:
                        settings_dict["email"] = u.email
                    meta = u.user_metadata or {}
                    if not settings_dict.get("fullName") and (meta.get("full_name") or meta.get("name")):
                        settings_dict["fullName"] = meta.get("full_name") or meta.get("name")
                    prefs = meta.get("preferences", {})
                    if isinstance(prefs, dict):
                        for k, v in prefs.items():
                            if k in settings_dict and v is not None:
                                settings_dict[k] = v
            except Exception as auth_err:
                print(f"[ProfileService] Auth user fetch notice: {auth_err}")

        except Exception as e:
            print(f"[ProfileService] Get settings error: {e}")

        return settings_dict

    @classmethod
    async def update_settings(cls, data: UserSettingsSchema, user_id: Optional[str] = None) -> Dict[str, Any]:
        target_uid = resolve_user_id(user_id or data.userId)
        if not target_uid or not supabase_admin:
            return data.model_dump()

        try:
            # 1. Update public.profiles
            profile_update = {}
            if data.fullName is not None:
                profile_update["full_name"] = data.fullName
            if data.businessName is not None:
                profile_update["business_name"] = data.businessName
            if data.currency is not None:
                profile_update["currency"] = data.currency

            if profile_update:
                supabase_admin.from_("profiles").update(profile_update).eq("id", target_uid).execute()

            # 2. Update user_metadata preferences
            try:
                auth_user = supabase_admin.auth.admin.get_user_by_id(target_uid)
                current_meta = (auth_user.user.user_metadata or {}) if (auth_user and auth_user.user) else {}
                
                prefs = {
                    "paymentTerms": data.paymentTerms,
                    "reminderTone": data.reminderTone,
                    "firstReminder": data.firstReminder,
                    "repeatReminder": data.repeatReminder,
                    "emailNotifications": data.emailNotifications,
                    "overdueAlerts": data.overdueAlerts,
                    "paymentNotifications": data.paymentNotifications,
                    "weeklySummary": data.weeklySummary,
                    "theme": data.theme,
                }

                current_meta["preferences"] = prefs
                if data.fullName:
                    current_meta["full_name"] = data.fullName

                supabase_admin.auth.admin.update_user_by_id(
                    target_uid,
                    {"user_metadata": current_meta}
                )
            except Exception as auth_err:
                print(f"[ProfileService] Auth user update notice: {auth_err}")

        except Exception as e:
            print(f"[ProfileService] Update settings error: {e}")
            raise e

        return await cls.get_settings(target_uid)
