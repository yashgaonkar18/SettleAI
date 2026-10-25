from typing import List, Optional, Literal
from pydantic import BaseModel, Field

class LineItemSchema(BaseModel):
    id: Optional[str] = None
    description: str = Field(..., min_length=1)
    quantity: float = Field(default=1.0, gt=0)
    rate: float = Field(default=0.0, ge=0)
    amount: float = Field(default=0.0, ge=0)

class CreateInvoiceSchema(BaseModel):
    invoiceNumber: Optional[str] = None
    clientName: str = Field(..., min_length=1)
    clientEmail: str = Field(...)
    amount: Optional[float] = None
    dueDate: str = Field(..., min_length=1)
    lineItems: List[LineItemSchema] = Field(..., min_items=1)
    notes: Optional[str] = None
    userId: Optional[str] = "user-default"

class UpdateStatusSchema(BaseModel):
    status: Literal["draft", "sent", "paid", "overdue", "cancelled"]
    paidAmount: Optional[float] = None

class PromptInvoiceSchema(BaseModel):
    prompt: str = Field(..., min_length=3)

class GenerateReminderSchema(BaseModel):
    invoiceId: str
    tone: Literal["friendly", "firm", "final"] = "friendly"
    userId: Optional[str] = "user-default"
