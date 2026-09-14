from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    ENV: str = "development"
    PORT: int = 8000
    CORRIDOR_DEFAULT: str = "NDLS-PRYJ"

    RAILRADAR_API_KEY: str = ""

    # Supported values: synthetic / railradar
    DATA_SOURCE: str = "synthetic"

    # Used later for controlling RailRadar polling frequency
    RAILRADAR_REFRESH_SECONDS: int = 60

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()