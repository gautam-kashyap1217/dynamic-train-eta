from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    ENV: str = "development"

    PORT: int = 8000

    CORRIDOR_DEFAULT: str = "NDLS-PRYJ"

    RAILRADAR_API_KEY: str = ""

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()