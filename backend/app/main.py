from contextlib import asynccontextmanager
from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import invoices, reminders, payments, dashboard
from app.jobs.overdue_job import start_overdue_scheduler, scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    start_overdue_scheduler()
    print(
        f"""
  [Server] SettleAI Python FastAPI Backend is running!
  URL: http://127.0.0.1:{settings.PORT}
  Health: http://127.0.0.1:{settings.PORT}/api/health
  Gemini Model: {settings.GEMINI_MODEL}
  PayPal Base: {settings.PAYPAL_BASE_URL}
  Supabase: {settings.SUPABASE_URL or 'configured'}
    """
    )
    yield
    if scheduler.running:
        scheduler.shutdown()
        print("Scheduler shut down.")


app = FastAPI(
    title="SettleAI Backend",
    description="Python FastAPI backend for SettleAI invoicing, Gemini AI parsing & PayPal integration",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "SettleAI Python FastAPI Backend",
        "timestamp": datetime.now().isoformat(),
    }


app.include_router(invoices.router)
app.include_router(reminders.router)
app.include_router(payments.router)
app.include_router(dashboard.router)
