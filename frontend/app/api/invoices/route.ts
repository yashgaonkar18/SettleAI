import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    invoices: [
      {
        id: "inv-1",
        invoiceNumber: "INV-2026-001",
        clientName: "Acme Corp",
        amount: 1200,
        status: "overdue",
        dueDate: "2026-10-14",
      },
    ],
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json({
      success: true,
      message: "Invoice created successfully",
      invoice: {
        id: `inv-${Date.now()}`,
        invoiceNumber: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
        ...body,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Invalid request payload" }, { status: 400 });
  }
}
