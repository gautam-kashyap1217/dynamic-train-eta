from typing import Optional

from pydantic import BaseModel, Field


class ETARequest(BaseModel):

    train_id: str = Field(
        ...,
        description=(
            "Internal system train ID, e.g. TRN10000"
        )
    )

    train_number: Optional[str] = Field(
        None,
        description=(
            "Real railway train number, e.g. 12951"
        )
    )


class ETAResponse(BaseModel):

    # ---------------------------------------------------------
    # Train identification
    # ---------------------------------------------------------

    train_id: str

    train_number: str

    # ---------------------------------------------------------
    # Current train position
    # ---------------------------------------------------------

    current_station: str

    next_station: str

    current_delay: float

    speed_kmph: float

    # ---------------------------------------------------------
    # ETA prediction
    # ---------------------------------------------------------

    eta_minutes: float

    # ---------------------------------------------------------
    # Quantile prediction
    # ---------------------------------------------------------

    p10: float

    p50: float

    p90: float

    # ---------------------------------------------------------
    # Model confidence
    # ---------------------------------------------------------

    confidence: Optional[float] = Field(
        None,
        ge=0,
        le=100,
        description=(
            "Uncertainty-based model confidence indicator. "
            "It is derived from the spread of the ensemble "
            "prediction and is not a calibrated probability."
        )
    )

    confidence_level: Optional[str] = Field(
        None,
        description=(
            "Human-readable interpretation of the "
            "uncertainty-based confidence indicator."
        )
    )

    confidence_reason: Optional[str] = Field(
        None,
        description=(
            "Explanation of the uncertainty level used "
            "for the confidence indicator."
        )
    )

    # ---------------------------------------------------------
    # Early arrival and delay margins
    # ---------------------------------------------------------

    can_arrive_earlier_by: float = 0.0

    can_be_delayed_by: float = 0.0

    # ---------------------------------------------------------
    # Scheduled vs predicted arrival
    # ---------------------------------------------------------

    scheduled_arrival: Optional[str] = None

    predicted_arrival: Optional[str] = None

    # ---------------------------------------------------------
    # Predicted delay at destination
    # ---------------------------------------------------------

    predicted_delay_minutes: Optional[float] = Field(
        None,
        description=(
            "Difference in minutes between predicted arrival "
            "and scheduled arrival. Positive means late, "
            "negative means early."
        )
    )

    # ---------------------------------------------------------
    # Arrival prediction range
    # ---------------------------------------------------------

    arrival_range_start: Optional[str] = None

    arrival_range_end: Optional[str] = None

    # ---------------------------------------------------------
    # Scheduled vs predicted departure
    # ---------------------------------------------------------

    scheduled_departure: Optional[str] = None

    predicted_departure: Optional[str] = None

    # ---------------------------------------------------------
    # Departure prediction range
    # ---------------------------------------------------------

    departure_range_start: Optional[str] = None

    departure_range_end: Optional[str] = None

    # ---------------------------------------------------------
    # Prediction accuracy
    # ---------------------------------------------------------

    prediction_accuracy: Optional[float] = Field(
        None,
        description=(
            "Validated prediction accuracy within ±5 minutes. "
            "This remains unavailable until actual arrival "
            "data is available for validation."
        )
    )