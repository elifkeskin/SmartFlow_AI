from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    DATABASE_URL: str = "sqlite:///./smartflow.db"
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"
    RESEND_API_KEY: str = ""
    RESEND_FROM_EMAIL: str = "noreply@smartflow.ai"
    MANAGER_EMAIL: str = ""


settings = Settings()
