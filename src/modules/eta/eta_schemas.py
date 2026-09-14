from typing import Optional
from pydantic import BaseModel, Field


class ETARequest(BaseModel):
    train_id: str = Field(
        ...,
        description="Internal system train ID, e.g. TRN10000"
    )

    train_number: Optional[str] = Field(
        None,
        description="Real railway train number, e.g. 12951"
    )


class ETAResponse(BaseModel):
    # Train identification
    train_id: str
    train_number: str

    # Current train position
    current_station: str
    next_station: str
    current_delay: float
    speed_kmph: float

    # Live position details
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    distance_travelled_km: Optional[float] = None
    timestamp: Optional[str] = None

    # Data provider information
    data_source: str = "unknown"
    is_simulated: bool = False

    # ETA prediction
    eta_minutes: float

    # Quantile prediction
    p10: float
    p50: float
    p90: float

    # Early arrival and delay margins
    can_arrive_earlier_by: float = 0.0
    can_be_delayed_by: float = 0.0

    # Scheduled vs predicted arrival
    scheduled_arrival: Optional[str] = None
    predicted_arrival: Optional[str] = None

    # Arrival prediction range
    arrival_range_start: Optional[str] = None
    arrival_range_end: Optional[str] = None

    # Scheduled vs predicted departure
    scheduled_departure: Optional[str] = None
    predicted_departure: Optional[str] = None

    # Departure prediction range
    departure_range_start: Optional[str] = None
    departure_range_end: Optional[str] = None

    # Prediction accuracy
    prediction_accuracy: Optional[float] = Field(
        None,
        description="Validated prediction accuracy within ±5 minutes"
    )