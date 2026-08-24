from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Loaded from backend/.env. See backend/.env.example for what each value means."""

    # Supabase Postgres, via the Session Pooler (port 5432) connection string.
    # SQLAlchemy needs real prepared-statement support, which the Transaction
    # Pooler (port 6543) does not give it -- do not swap the port.
    database_url: str

    # Project URL, e.g. https://<ref>.supabase.co -- used to build the JWKS
    # endpoint for verifying Supabase-issued access tokens.
    supabase_url: str

    # Server-only. Bypasses Row Level Security. Used exclusively by
    # utils/supabase_admin.py to mint signed Storage upload URLs. Must never
    # reach the browser or a NEXT_PUBLIC_ variable.
    supabase_service_role_key: str

    # Comma-separated list of allowed browser origins for CORS.
    cors_origins: str = "http://localhost:3000"

    storage_bucket: str = "blog-media"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


settings = Settings()
