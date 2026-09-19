import math

from datetime import datetime, timedelta
from typing import Optional


from src.modules.eta.eta_schemas import (
    ETARequest,
    ETAResponse,
)

from src.modules.eta.eta_repository import (
    eta_repository
)

from src.modules.train.train_service import (
    train_service
)

from src.modules.weather.weather_service import (
    weather_service
)

from src.integrations.railway.railradar_client import (
    railradar_client
)

from src.integrations.ml.feature_pipeline import (
    FeaturePipeline
)

from src.integrations.ml.inference_engine import (
    inference_engine
)


class ETAService:
    """
    Generates ETA predictions using:

    - Railway graph data
    - Open-Meteo weather data
    - RailRadar timetable data
    - Machine learning prediction models
    """

    FALLBACK_DISTANCE_KM = 10.0

    FALLBACK_SPEED_KMPH = 50.0

    FALLBACK_CONGESTION = 0.5

    DEFAULT_WEATHER = {
        "condition": "Clear",
        "visibility_km": 10.0,
        "rainfall_mm": 0.0,
        "temperature_c": 25.0,
        "humidity_percent": 60.0,
        "wind_speed_kmph": 10.0,
    }

    def __init__(self):

        self.feature_pipeline = FeaturePipeline(
            inference_engine.feature_columns
        )

    # =========================================================
    # GRAPH
    # =========================================================

    def _get_segment_data(
        self,
        current_station: str,
        next_station: str
    ):

        segment = (
            eta_repository.get_segment_data(
                current_station,
                next_station
            )
        )

        if segment is not None:
            return segment, False

        print(
            "Graph segment not found:",
            f"{current_station} -> {next_station}"
        )

        print(
            "Using temporary fallback "
            "segment estimate."
        )

        fallback_segment = {
            "distance_km":
                self.FALLBACK_DISTANCE_KM,

            "average_speed_kmph":
                self.FALLBACK_SPEED_KMPH,

            "congestion":
                self.FALLBACK_CONGESTION,

            "route_segment_id":
                (
                    f"FALLBACK_"
                    f"{current_station}_"
                    f"{next_station}"
                ),
        }

        return fallback_segment, True

    # =========================================================
    # WEATHER
    # =========================================================

    def _get_weather_data(
        self,
        current_station: str
    ):

        try:

            weather = (
                weather_service.get_weather(
                    current_station
                )
            )

            weather_data = {
                "condition":
                    weather.condition,

                "visibility_km":
                    weather.visibility_km,

                "rainfall_mm":
                    weather.rainfall_mm,

                "temperature_c":
                    weather.temperature_c,

                "humidity_percent":
                    weather.humidity_percent,

                "wind_speed_kmph":
                    weather.wind_speed_kmph,
            }

            print(
                "Weather data used for ETA:",
                weather_data
            )

            return weather_data

        except Exception as error:

            print(
                "Weather retrieval failed. "
                "Using default weather values:",
                error
            )

            return self.DEFAULT_WEATHER.copy()

    # =========================================================
    # TIMETABLE
    # =========================================================

    @staticmethod
    def _parse_schedule_datetime(
        time_value: Optional[str],
        day_value: Optional[int],
        current_time: datetime
    ) -> Optional[str]:

        if not time_value:
            return None

        try:

            time_text = str(
                time_value
            ).strip()

            parsed_time = datetime.strptime(
                time_text,
                "%H:%M"
            ).time()

            if day_value is None:
                day_offset = 0
            else:
                day_offset = max(
                    int(day_value) - 1,
                    0
                )

            schedule_date = (
                current_time.date()
                + timedelta(
                    days=day_offset
                )
            )

            scheduled_datetime = datetime.combine(
                schedule_date,
                parsed_time,
                tzinfo=current_time.tzinfo
            )

            return (
                scheduled_datetime.isoformat()
            )

        except (
            TypeError,
            ValueError
        ):

            print(
                "Unable to parse timetable value:",
                time_value,
                day_value
            )

            return None

    def _get_schedule_times(
        self,
        train_number: str,
        current_station: str,
        next_station: str,
        current_time: datetime
    ):

        schedule_result = {
            "scheduled_arrival": None,
            "scheduled_departure": None,
        }

        try:

            details = (
                railradar_client.get_train_details(
                    train_number
                )
            )

            route = (
                details
                .get("data", {})
                .get("route", [])
            )

            if not route:

                print(
                    "No timetable route found "
                    "for train:",
                    train_number
                )

                return schedule_result

            normalized_current_station = (
                str(current_station)
                .strip()
                .upper()
            )

            normalized_next_station = (
                str(next_station)
                .strip()
                .upper()
            )

            current_route_item = None
            next_route_item = None

            for route_item in route:

                station = route_item.get(
                    "station",
                    {}
                )

                station_code = str(
                    station.get(
                        "code",
                        ""
                    )
                ).strip().upper()

                if (
                    station_code
                    == normalized_current_station
                ):
                    current_route_item = (
                        route_item
                    )

                if (
                    station_code
                    == normalized_next_station
                ):
                    next_route_item = (
                        route_item
                    )

            if current_route_item is not None:

                schedule_result[
                    "scheduled_departure"
                ] = self._parse_schedule_datetime(
                    time_value=
                        current_route_item.get(
                            "departure"
                        ),
                    day_value=
                        current_route_item.get(
                            "departureDay"
                        ),
                    current_time=current_time
                )

            if next_route_item is not None:

                schedule_result[
                    "scheduled_arrival"
                ] = self._parse_schedule_datetime(
                    time_value=
                        next_route_item.get(
                            "arrival"
                        ),
                    day_value=
                        next_route_item.get(
                            "arrivalDay"
                        ),
                    current_time=current_time
                )

            return schedule_result

        except Exception as error:

            print(
                "Timetable retrieval failed. "
                "Continuing without scheduled times:",
                error
            )

            return schedule_result

    # =========================================================
    # TRAIN NUMBER
    # =========================================================

    def _get_train_number(
        self,
        request: ETARequest
    ) -> str:

        train_info = (
            train_service.get_train_mapping(
                request.train_id
            )
        )

        if train_info is not None:

            return str(
                train_info["train_number"]
            )

        if request.train_number:

            return str(
                request.train_number
            ).strip()

        raise ValueError(
            f"No train mapping found "
            f"for {request.train_id}"
        )

    # =========================================================
    # PREDICTED DELAY
    # =========================================================

    @staticmethod
    def _calculate_predicted_delay_minutes(
        scheduled_arrival: Optional[str],
        predicted_arrival: Optional[str]
    ) -> Optional[float]:

        if (
            not scheduled_arrival
            or not predicted_arrival
        ):
            return None

        try:

            scheduled_datetime = (
                datetime.fromisoformat(
                    scheduled_arrival
                )
            )

            predicted_datetime = (
                datetime.fromisoformat(
                    predicted_arrival
                )
            )

            delay_seconds = (
                predicted_datetime
                - scheduled_datetime
            ).total_seconds()

            return round(
                delay_seconds / 60.0,
                2
            )

        except (
            TypeError,
            ValueError
        ) as error:

            print(
                "Unable to calculate predicted "
                "arrival delay:",
                error
            )

            return None

    # =========================================================
    # CONFIDENCE
    # =========================================================

    @staticmethod
    def _calculate_confidence(
        p10: float,
        p50: float,
        p90: float,
        ensemble_std: float,
        ml_success: bool,
        is_fallback_segment: bool
    ):
        """
        Calculate an uncertainty-based confidence indicator.

        This is NOT a calibrated probability.

        The score uses two model-ensemble uncertainty signals:

        1. P10-P90 prediction interval width
        2. Standard deviation of individual tree predictions

        Narrower uncertainty -> higher confidence.

        Wider uncertainty -> lower confidence.

        A fallback graph segment receives an additional penalty.
        """

        if not ml_success:
            return {
                "score": 30.0,
                "level": "Low",
                "reason": (
                    "ML prediction failed; "
                    "fallback ETA is being used."
                ),
            }

        safe_p50 = max(
            abs(float(p50)),
            5.0
        )

        interval_width = max(
            float(p90) - float(p10),
            0.0
        )

        safe_std = max(
            float(ensemble_std),
            0.0
        )

        relative_interval = (
            interval_width / safe_p50
        )

        relative_std = (
            safe_std / safe_p50
        )

        # Combine ensemble interval uncertainty and
        # tree-to-tree dispersion.
        uncertainty_score = (
            0.70 * relative_interval
            + 0.30 * relative_std
        )

        confidence = (
            100.0
            * math.exp(
                -uncertainty_score / 2.0
            )
        )

        if is_fallback_segment:
            confidence *= 0.70

        confidence = max(
            10.0,
            min(
                confidence,
                99.0
            )
        )

        confidence = round(
            confidence,
            1
        )

        # Human-readable interpretation.
        if confidence >= 85.0:

            level = "High"

            reason = (
                "The model ensemble has a relatively "
                "narrow prediction spread."
            )

        elif confidence >= 65.0:

            level = "Moderate"

            reason = (
                "The model shows moderate uncertainty "
                "around the predicted ETA."
            )

        else:

            level = "Low"

            reason = (
                "The model ensemble shows a relatively "
                "wide prediction spread."
            )

        if is_fallback_segment:

            reason += (
                " Confidence is reduced because the "
                "railway graph segment is using fallback data."
            )

        return {
            "score": confidence,
            "level": level,
            "reason": reason,
        }

    # =========================================================
    # MAIN ETA PREDICTION
    # =========================================================

    def predict_eta(
        self,
        request: ETARequest,
        current_station: str,
        next_station: str,
        current_delay: float = 0.0
    ) -> ETAResponse:
        """
        Generate an ETA prediction for the next station.
        """

        effective_delay = max(
            float(current_delay),
            0.0
        )

        # -----------------------------------------------------
        # GRAPH SEGMENT
        # -----------------------------------------------------

        segment, is_fallback_segment = (
            self._get_segment_data(
                current_station=current_station,
                next_station=next_station
            )
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
                (
                    f"{current_station}_"
                    f"{next_station}"
                )
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
            distance_km
            / speed_kmph
        ) * 60

        graph_eta_minutes = max(
            graph_eta_minutes
            + effective_delay,
            0.0
        )

        # -----------------------------------------------------
        # TRAIN NUMBER
        # -----------------------------------------------------

        train_number = (
            self._get_train_number(
                request
            )
        )

        current_time = (
            datetime.now().astimezone()
        )

        # -----------------------------------------------------
        # WEATHER
        # -----------------------------------------------------

        weather_data = (
            self._get_weather_data(
                current_station
            )
        )

        # -----------------------------------------------------
        # TIMETABLE
        # -----------------------------------------------------

        schedule_times = (
            self._get_schedule_times(
                train_number=train_number,
                current_station=current_station,
                next_station=next_station,
                current_time=current_time
            )
        )

        # -----------------------------------------------------
        # ROUTE GEOMETRY
        # -----------------------------------------------------

        try:

            route_data = (
                railradar_client.get_train_route(
                    train_number
                )
            )

            coordinates = (
                route_data
                .get("data", {})
                .get("geojson", {})
                .get("geometry", {})
                .get("coordinates", [])
            )

            print(
                "Total route points:",
                len(coordinates)
            )

        except Exception as error:

            print(
                "Train route request failed. "
                "Continuing without route geometry:",
                error
            )

        # -----------------------------------------------------
        # 81-FEATURE ML INPUT
        # -----------------------------------------------------

        raw_data = {

            "current_station":
                current_station,

            "next_station":
                next_station,

            "distance_to_next_station_km":
                distance_km,

            "current_speed_kmph":
                speed_kmph,

            "speed_kmph":
                speed_kmph,

            "scheduled_speed_kmph":
                speed_kmph,

            "section_average_speed_kmph":
                speed_kmph,

            "current_delay_min":
                effective_delay,

            "delay_min":
                effective_delay,

            "baseline_eta_min":
                graph_eta_minutes,

            "scheduled_travel_time_min":
                graph_eta_minutes,

            "route_segment_id":
                route_segment_id,

            "route_segment_id_network":
                route_segment_id,

            "geo_distance_to_next_km":
                distance_km,

            "track_congestion":
                congestion,

            # -------------------------------------------------
            # WEATHER FEATURES
            # -------------------------------------------------

            "weather":
                weather_data["condition"],

            "visibility_km":
                weather_data[
                    "visibility_km"
                ],

            "rainfall_mm":
                weather_data[
                    "rainfall_mm"
                ],

            "temperature_c":
                weather_data[
                    "temperature_c"
                ],

            "humidity_percent":
                weather_data[
                    "humidity_percent"
                ],

            "wind_speed_kmph":
                weather_data[
                    "wind_speed_kmph"
                ],
        }

        print(
            "Building 81-feature ML input..."
        )

        features_df = (
            self.feature_pipeline.build_features(
                raw_data
            )
        )

        print(
            "ML feature matrix shape:",
            features_df.shape
        )

        # -----------------------------------------------------
        # ML PREDICTION
        # -----------------------------------------------------

        ml_success = True

        ensemble_std = 0.0

        try:

            prediction = (
                inference_engine.predict(
                    features_df
                )
            )

            p10 = max(
                float(
                    prediction["p10"]
                ),
                0.0
            )

            p50 = max(
                float(
                    prediction["p50"]
                ),
                0.0
            )

            p90 = max(
                float(
                    prediction["p90"]
                ),
                0.0
            )

            ensemble_std = max(
                float(
                    prediction.get(
                        "ensemble_std",
                        0.0
                    )
                ),
                0.0
            )

        except Exception as error:

            ml_success = False

            print(
                "ML prediction failed. "
                "Using graph/fallback ETA:",
                error
            )

            p10 = graph_eta_minutes
            p50 = graph_eta_minutes
            p90 = graph_eta_minutes

            ensemble_std = 0.0

        # -----------------------------------------------------
        # CONFIDENCE
        # -----------------------------------------------------

        confidence_result = (
            self._calculate_confidence(
                p10=p10,
                p50=p50,
                p90=p90,
                ensemble_std=ensemble_std,
                ml_success=ml_success,
                is_fallback_segment=is_fallback_segment
            )
        )

        confidence = confidence_result[
            "score"
        ]

        confidence_level = (
            confidence_result[
                "level"
            ]
        )

        confidence_reason = (
            confidence_result[
                "reason"
            ]
        )

        print(
            "ETA confidence:",
            confidence,
            "%",
            "| Level:",
            confidence_level,
            "| ML:",
            ml_success,
            "| Ensemble STD:",
            round(
                ensemble_std,
                2
            ),
            "| P10:",
            p10,
            "| P50:",
            p50,
            "| P90:",
            p90
        )

        # -----------------------------------------------------
        # PREDICTION MARGINS
        # -----------------------------------------------------

        can_arrive_earlier_by = max(
            p50 - p10,
            0.0
        )

        can_be_delayed_by = max(
            p90 - p50,
            0.0
        )

        eta_minutes = p50

        predicted_arrival = (
            current_time
            + timedelta(
                minutes=p50
            )
        )

        arrival_range_start = (
            current_time
            + timedelta(
                minutes=p10
            )
        )

        arrival_range_end = (
            current_time
            + timedelta(
                minutes=p90
            )
        )

        predicted_delay_minutes = (
            self._calculate_predicted_delay_minutes(
                scheduled_arrival=(
                    schedule_times[
                        "scheduled_arrival"
                    ]
                ),
                predicted_arrival=(
                    predicted_arrival.isoformat()
                )
            )
        )

        if is_fallback_segment:

            print(
                "Warning: ETA uses a temporary "
                "fallback segment because the "
                "live segment is missing from "
                "the graph."
            )

        # -----------------------------------------------------
        # RESPONSE
        # -----------------------------------------------------

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

            confidence=confidence,

            confidence_level=confidence_level,

            confidence_reason=confidence_reason,

            can_arrive_earlier_by=round(
                can_arrive_earlier_by,
                2
            ),

            can_be_delayed_by=round(
                can_be_delayed_by,
                2
            ),

            scheduled_arrival=(
                schedule_times[
                    "scheduled_arrival"
                ]
            ),

            predicted_arrival=(
                predicted_arrival.isoformat()
            ),

            predicted_delay_minutes=(
                predicted_delay_minutes
            ),

            arrival_range_start=(
                arrival_range_start.isoformat()
            ),

            arrival_range_end=(
                arrival_range_end.isoformat()
            ),

            scheduled_departure=(
                schedule_times[
                    "scheduled_departure"
                ]
            ),

            predicted_departure=None,

            departure_range_start=None,

            departure_range_end=None,

            prediction_accuracy=None
        )


eta_service = ETAService()