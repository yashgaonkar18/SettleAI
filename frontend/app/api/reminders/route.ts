import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success: true,
    reminders: [
      {
        id: "rem-1",
        invoiceId: "inv-1",
        clientName: "Acme Corp",
        amount: 1200,
        daysLate: 9,
        tone: "firm",
        status: "pending_approval",
      },
    ],
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    return NextResponse.json({
      success: true,
      message: "Reminder dispatched successfully via PayPal Orders & Email",
      data: body,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Invalid request payload" }, { status: 400 });
  }
}
