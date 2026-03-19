from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Citizen Complaint API"
    api_v1_prefix: str = "/api/v1"
    frontend_url: str = "http://localhost:5173"
    allowed_origins: str = "http://localhost:5173"
    evidence_bucket: str = "complaint-evidence"

    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
