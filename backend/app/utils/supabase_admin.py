from functools import lru_cache

from supabase import Client, create_client

from app.core.config import settings


@lru_cache(maxsize=1)
def get_supabase_admin() -> Client:
    """One shared client per process, holding the sb_secret_ (service_role)
    key. This key bypasses Row Level Security entirely -- it must never reach
    the browser or a NEXT_PUBLIC_ env var. Only this module and the code that
    calls it (media.py, admin services) may touch it."""
    return create_client(settings.supabase_url, settings.supabase_service_role_key)
