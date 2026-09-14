from datetime import datetime

from src.config.env import settings
from src.modules.live_data.live_data_schema import LiveTrainData
from src.modules.live_data.synthetic_provider import SyntheticProvider
from src.integrations.railway.railradar_client import railradar_client


class LiveDataService:
    """
    Selects synthetic or RailRadar data based on DATA_SOURCE.
    """

    def __init__(self):
        self.synthetic_provider = SyntheticProvider()

    def get_train_data(self, train_number: str) -> LiveTrainData:
        if settings.DATA_SOURCE.lower() == "synthetic":
            return self.synthetic_provider.get_train_data(train_number)

        if settings.DATA_SOURCE.lower() == "railradar":
            return self._get_railradar_data(train_number)

        raise ValueError(
            f"Unsupported DATA_SOURCE: {settings.DATA_SOURCE}"
        )

    def _get_railradar_data(self, train_number: str) -> LiveTrainData:
        """
        Uses the existing RailRadar client.
        The RailRadar client itself is not modified.
        """

        live_response = railradar_client.get_live_train_status(
            train_number
        )

        if not live_response or not live_response.get("success"):
            raise ValueError(
                f"Live status unavailable for train {train_number}"
            )

        live_data = live_response.get("data", {})

        current_location = live_data.get(
            "currentLocation",
            {}
        )

        next_halt = live_data.get(
            "nextHalt",
            {}
        )

        current_station = (
            current_location.get("stationCode")
            or current_location.get("stationName")
        )

        next_station = (
            next_halt.get("stationCode")
            or next_halt.get("stationName")
        )

        current_delay = max(
            float(
                current_location.get(
                    "delayMinutes",
                    live_data.get("delayMinutes", 0)
                )
                or 0
            ),
            0.0
        )

        latitude = float(
            current_location.get(
                "latitude",
                live_data.get("latitude", 0)
            )
            or 0
        )

        longitude = float(
            current_location.get(
                "longitude",
                live_data.get("longitude", 0)
            )
            or 0
        )

        speed = float(
            current_location.get(
                "speed",
                live_data.get("speed", 0)
            )
            or 0
        )

        return LiveTrainData(
            train_number=train_number,
            current_station=current_station,
            next_station=next_station,
            latitude=latitude,
            longitude=longitude,
            speed_kmph=speed,
            delay_minutes=current_delay,
            distance_travelled_km=0.0,
            timestamp=datetime.now().astimezone(),
            data_source="railradar",
            is_simulated=False,
        )


live_data_service = LiveDataService()