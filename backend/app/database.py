from supabase import create_client, Client
from app.config import settings

supabase_admin: Client | None = None
supabase: Client | None = None

try:
    if settings.SUPABASE_URL and (settings.SUPABASE_SECRET_KEY or settings.SUPABASE_PUBLISHABLE_KEY):
        key = settings.SUPABASE_SECRET_KEY if settings.SUPABASE_SECRET_KEY else settings.SUPABASE_PUBLISHABLE_KEY
        supabase_admin = create_client(settings.SUPABASE_URL, key)
        supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_PUBLISHABLE_KEY or key)
    else:
        print("[Supabase] Credentials not found in environment.")
except Exception as e:
    print(f"[Supabase] Client initialization warning: {e}")
