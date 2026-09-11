from src.modules.eta.eta_schemas import ETARequest, ETAResponse
from src.modules.eta.eta_repository import eta_repository
from src.modules.train.train_service import train_service


class ETAService:
    """Coordinates graph data for ETA prediction."""

    def predict_eta(
        self,
        request: ETARequest,
        current_station: str,
        next_station: str,
        current_delay: float = 0.0
    ) -> ETAResponse:

        segment = eta_repository.get_segment_data(
            current_station,
            next_station
        )

        if segment is None:
            raise ValueError(
                f"No graph segment found: "
                f"{current_station} -> {next_station}"
            )

        distance_km = float(segment["distance_km"])
        speed_kmph = float(segment["average_speed_kmph"])

        if speed_kmph <= 0:
            raise ValueError("Invalid segment speed.")

        base_eta_minutes = (
            distance_km / speed_kmph
        ) * 60

        # Adjust ETA using the train's current delay.
        adjusted_eta_minutes = (
            base_eta_minutes + current_delay
        )

        # Prevent negative ETA values.
        adjusted_eta_minutes = max(
            adjusted_eta_minutes,
            0.0
        )

        train_info = train_service.get_train_mapping(
            request.train_id
        )

        if train_info is None:
            raise ValueError(
                f"No train mapping found for {request.train_id}"
            )

        train_number = train_info["train_number"]

        return ETAResponse(
            train_id=request.train_id,
            train_number=train_number,
            current_station=current_station,
            next_station=next_station,
            current_delay=current_delay,
            speed_kmph=speed_kmph,
            eta_minutes=round(adjusted_eta_minutes, 2),
            p10=round(adjusted_eta_minutes, 2),
            p50=round(adjusted_eta_minutes, 2),
            p90=round(adjusted_eta_minutes, 2)
        )


eta_service = ETAService()