from typing import Optional, Literal
from pydantic import BaseModel

class UserSettingsSchema(BaseModel):
    fullName: Optional[str] = "Yash"
    email: Optional[str] = ""
    businessName: Optional[str] = "My Business"
    currency: Optional[str] = "USD"
    paymentTerms: Optional[str] = "net-30"
    reminderTone: Optional[str] = "friendly"
    firstReminder: Optional[str] = "1"
    repeatReminder: Optional[str] = "7"
    emailNotifications: Optional[bool] = True
    overdueAlerts: Optional[bool] = True
    paymentNotifications: Optional[bool] = True
    weeklySummary: Optional[bool] = False
    theme: Optional[Literal["light", "dark"]] = "light"
    userId: Optional[str] = None
