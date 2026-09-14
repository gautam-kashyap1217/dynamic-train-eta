from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class LiveTrainData(BaseModel):
    train_number: str

    current_station: Optional[str] = None
    next_station: Optional[str] = None

    latitude: float
    longitude: float

    speed_kmph: float = Field(default=0.0, ge=0)
    delay_minutes: float = 0.0

    distance_travelled_km: float = 0.0

    timestamp: datetime

    data_source: str
    is_simulated: bool = False