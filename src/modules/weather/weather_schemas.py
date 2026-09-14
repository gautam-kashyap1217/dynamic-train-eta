from pydantic import BaseModel, Field
from typing import Optional


class WeatherData(BaseModel):
    location: str
    temperature_c: float = Field(..., description="Temperature in Celsius")
    rainfall_mm: float = Field(0.0, ge=0)
    wind_speed_kmph: float = Field(0.0, ge=0)
    visibility_km: float = Field(10.0, ge=0)
    humidity_percent: float = Field(0.0, ge=0, le=100)
    condition: str = "Clear"


class WeatherResponse(BaseModel):
    success: bool = True
    data: WeatherData


class WeatherFeatures(BaseModel):
    temperature_c: float
    rainfall_mm: float
    wind_speed_kmph: float
    visibility_km: float
    humidity_percent: float
    weather_severity: float