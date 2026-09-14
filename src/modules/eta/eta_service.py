from datetime import datetime, timedelta

from src.modules.eta.eta_schemas import ETARequest, ETAResponse
from src.modules.eta.eta_repository import eta_repository
from src.modules.train.train_service import train_service

from src.modules.weather.weather_service import weather_service

from src.integrations.railway.railradar_client import railradar_client
from src.integrations.ml.feature_pipeline import FeaturePipeline
from src.integrations.ml.inference_engine import inference_engine


class ETAService:
    """Generates ETA predictions using graph data, weather data, and ML models."""

    # Temporary values used when the live railway segment is not
    # available in the local graph dataset.
    FALLBACK_DISTANCE_KM = 10.0
    FALLBACK_SPEED_KMPH = 50.0
    FALLBACK_CONGESTION = 0.5

    # Default weather values used if weather retrieval fails.
    DEFAULT_WEATHER = {
        "condition": "Clear",
        "visibility_km": 10.0,
        "rainfall_mm": 0.0,
        "temperature_c": 25.0,
        "humidity_percent": 60.0,
    }

    def __init__(self):
        self.feature_pipeline = FeaturePipeline(
            inference_engine.feature_columns
        )

    def _get_segment_data(
        self,
        current_station: str,
        next_station: str
    ):
        """
        Get railway segment data from the local graph.

        If the live segment is missing from the local graph, use a
        temporary fallback estimate so that ETA generation can continue.
        """

        segment = eta_repository.get_segment_data(
            current_station,
            next_station
        )

        if segment is not None:
            return segment, False

        print(
            "Graph segment not found:",
            f"{current_station} -> {next_station}"
        )

        print(
            "Using temporary fallback segment estimate."
        )

        fallback_segment = {
            "distance_km": self.FALLBACK_DISTANCE_KM,
            "average_speed_kmph": self.FALLBACK_SPEED_KMPH,
            "congestion": self.FALLBACK_CONGESTION,
            "route_segment_id": (
                f"FALLBACK_{current_station}_{next_station}"
            ),
        }

        return fallback_segment, True

    def _get_weather_data(self, current_station: str):
        """
        Get weather data for the current station.

        The current implementation uses the local/mock weather service.
        If weather retrieval fails, default weather values are returned.
        """

        try:
            weather = weather_service.get_weather(
                current_station
            )

            return {
                "condition": weather.condition,
                "visibility_km": weather.visibility_km,
                "rainfall_mm": weather.rainfall_mm,
                "temperature_c": weather.temperature_c,
                "humidity_percent": weather.humidity_percent,
            }

        except Exception as error:
            print(
                "Weather retrieval failed. "
                "Using default weather values:",
                error
            )

            return self.DEFAULT_WEATHER.copy()

    def predict_eta(
        self,
        request: ETARequest,
        current_station: str,
        next_station: str,
        current_delay: float = 0.0
    ) -> ETAResponse:

        effective_delay = max(
            float(current_delay),
            0.0
        )

        segment, is_fallback_segment = self._get_segment_data(
            current_station,
            next_station
        )

        distance_km = float(
            segment["distance_km"]
        )

        speed_kmph = float(
            segment["average_speed_kmph"]
        )

        congestion = float(
            segment.get(
                "congestion",
                self.FALLBACK_CONGESTION
            )
        )

        route_segment_id = str(
            segment.get(
                "route_segment_id",
                f"{current_station}_{next_station}"
            )
        )

        if distance_km <= 0:
            raise ValueError(
                "Invalid segment distance."
            )

        if speed_kmph <= 0:
            raise ValueError(
                "Invalid segment speed."
            )

        graph_eta_minutes = (
            distance_km / speed_kmph
        ) * 60

        graph_eta_minutes = max(
            graph_eta_minutes + effective_delay,
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

        # Get local/mock weather data for the current station.
        weather_data = self._get_weather_data(
            current_station
        )

        # Route data is useful for future map-based improvements.
        # ETA generation should continue even if this request fails.
        try:
            route_data = railradar_client.get_train_route(
                train_number
            )

            coordinates = (
                route_data.get("data", {})
                .get("geojson", {})
                .get("geometry", {})
                .get("coordinates", [])
            )

            print(
                "Total route points:",
                len(coordinates)
            )

            if coordinates:
                print(
                    "First route point:",
                    coordinates[0]
                )

                print(
                    "Last route point:",
                    coordinates[-1]
                )

        except Exception as error:
            print(
                "Train route request failed. "
                "Continuing without route geometry:",
                error
            )

        raw_data = {
            "current_station": current_station,
            "next_station": next_station,
            "distance_to_next_station_km": distance_km,

            "current_speed_kmph": speed_kmph,
            "speed_kmph": speed_kmph,
            "scheduled_speed_kmph": speed_kmph,
            "section_average_speed_kmph": speed_kmph,

            "current_delay_min": effective_delay,
            "delay_min": effective_delay,

            "baseline_eta_min": graph_eta_minutes,
            "scheduled_travel_time_min": graph_eta_minutes,

            "route_segment_id": route_segment_id,
            "route_segment_id_network": route_segment_id,
            "geo_distance_to_next_km": distance_km,

            "track_congestion": congestion,

            # Weather features
            "weather": weather_data["condition"],
            "visibility_km": weather_data["visibility_km"],
            "rainfall_mm": weather_data["rainfall_mm"],
            "temperature_c": weather_data["temperature_c"],
            "humidity_percent": weather_data["humidity_percent"],
        }

        print(
            "Weather data used for ETA:",
            weather_data
        )

        features_df = self.feature_pipeline.build_features(
            raw_data
        )

        try:
            prediction = inference_engine.predict(
                features_df
            )

            p10 = max(
                float(prediction["p10"]),
                0.0
            )

            p50 = max(
                float(prediction["p50"]),
                0.0
            )

            p90 = max(
                float(prediction["p90"]),
                0.0
            )

        except Exception as error:
            print(
                "ML prediction failed. "
                "Using graph/fallback ETA:",
                error
            )

            p10 = graph_eta_minutes
            p50 = graph_eta_minutes
            p90 = graph_eta_minutes

        can_arrive_earlier_by = max(
            p50 - p10,
            0.0
        )

        can_be_delayed_by = max(
            p90 - p50,
            0.0
        )

        eta_minutes = p50

        current_time = datetime.now().astimezone()

        predicted_arrival = (
            current_time + timedelta(minutes=p50)
        )

        arrival_range_start = (
            current_time + timedelta(minutes=p10)
        )

        arrival_range_end = (
            current_time + timedelta(minutes=p90)
        )

        if is_fallback_segment:
            print(
                "Warning: ETA uses a temporary fallback segment "
                "because the live segment is missing from the graph."
            )

        return ETAResponse(
            train_id=request.train_id,
            train_number=train_number,
            current_station=current_station,
            next_station=next_station,
            current_delay=effective_delay,
            speed_kmph=speed_kmph,
            eta_minutes=round(
                eta_minutes,
                2
            ),
            p10=round(
                p10,
                2
            ),
            p50=round(
                p50,
                2
            ),
            p90=round(
                p90,
                2
            ),
            can_arrive_earlier_by=round(
                can_arrive_earlier_by,
                2
            ),
            can_be_delayed_by=round(
                can_be_delayed_by,
                2
            ),
            scheduled_arrival=None,
            predicted_arrival=predicted_arrival.isoformat(),
            arrival_range_start=arrival_range_start.isoformat(),
            arrival_range_end=arrival_range_end.isoformat(),
            scheduled_departure=None,
            predicted_departure=None,
            departure_range_start=None,
            departure_range_end=None,
            prediction_accuracy=None
        )


eta_service = ETAService()