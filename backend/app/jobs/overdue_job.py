from datetime import datetime
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.database import supabase_admin
from app.services.reminder_service import ReminderService

scheduler = AsyncIOScheduler()

async def check_overdue_invoices():
    print("[Overdue Job Python] Checking for overdue invoices...")
    today_str = datetime.now().strftime("%Y-%m-%d")

    if not supabase_admin:
        return

    try:
        # Find sent invoices that have passed their due date
        res = (
            supabase_admin.from_("invoices")
            .select("id, user_id, due_date, status, client_name, amount")
            .eq("status", "sent")
            .lt("due_date", today_str)
            .execute()
        )

        overdue_invoices = res.data or []
        for inv in overdue_invoices:
            # Mark overdue
            supabase_admin.from_("invoices").update({"status": "overdue"}).eq("id", inv["id"]).execute()

            # Check if pending reminder already exists
            rem_res = (
                supabase_admin.from_("reminders")
                .select("id")
                .eq("invoice_id", inv["id"])
                .eq("status", "pending_approval")
                .maybe_single()
                .execute()
            )

            if not rem_res or not rem_res.data:
                await ReminderService.generate_reminder_draft(
                    user_id=inv["user_id"],
                    invoice_id=inv["id"],
                )

        print(f"[Overdue Job Python] Processed {len(overdue_invoices)} overdue invoices.")
    except Exception as e:
        print(f"[Overdue Job Python] Error: {e}")

def start_overdue_scheduler():
    scheduler.add_job(check_overdue_invoices, "cron", hour=9, minute=0)
    scheduler.start()
    print("[Cron] Python Overdue Invoices cron job scheduled (09:00 AM daily).")
