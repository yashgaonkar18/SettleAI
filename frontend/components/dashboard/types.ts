export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  paidAmount?: number;
  dueDate: string;
  daysLate?: number;
  status: InvoiceStatus;
  lineItems: LineItem[];
  paypalOrderId?: string;
  paymentLink?: string;
  createdAt: string;
}

export interface ReminderDraft {
  id: string;
  invoiceId: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  daysLate: number;
  tone: "friendly" | "firm" | "final";
  subject: string;
  message: string;
  paymentLink: string;
  status: "pending_approval" | "sent";
}
