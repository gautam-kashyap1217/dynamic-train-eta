import math
from datetime import datetime

import pandas as pd


class FeaturePipeline:
    def __init__(self, feature_columns):
        self.feature_columns = feature_columns

    @staticmethod
    def _number(value, default=0.0):
        try:
            if value is None:
                return default

            number = float(value)

            if math.isnan(number) or math.isinf(number):
                return default

            return number

        except (TypeError, ValueError):
            return default

    @staticmethod
    def _text(value, default="unknown"):
        if value is None:
            return default

        value = str(value).strip()

        return value if value else default

    def build_features(self, raw_data: dict) -> pd.DataFrame:
        """
        Convert live/simulation train data into the model's
        expected 81-feature format.
        """

        raw_data = raw_data or {}
        features = {}

        now = datetime.now()

        current_station = self._text(
            raw_data.get("current_station"),
            "NDLS"
        )

        next_station = self._text(
            raw_data.get("next_station"),
            "AGC"
        )

        distance_km = self._number(
            raw_data.get("distance_to_next_station_km"),
            0.0
        )

        current_speed = self._number(
            raw_data.get("current_speed_kmph"),
            raw_data.get("speed_kmph", 0.0)
        )

        scheduled_speed = self._number(
            raw_data.get("scheduled_speed_kmph"),
            100.0
        )

        section_average_speed = self._number(
            raw_data.get("section_average_speed_kmph"),
            scheduled_speed
        )

        current_delay = self._number(
            raw_data.get("current_delay_min"),
            raw_data.get("delay_min", 0.0)
        )

        weather = self._text(
            raw_data.get("weather"),
            "clear"
        )

        visibility = self._number(
            raw_data.get("visibility_km"),
            10.0
        )

        rainfall = self._number(
            raw_data.get("rainfall_mm"),
            0.0
        )

        temperature = self._number(
            raw_data.get("temperature_c"),
            25.0
        )

        humidity = self._number(
            raw_data.get("humidity_percent"),
            60.0
        )

        congestion = self._number(
            raw_data.get("track_congestion"),
            0.0
        )

        permanent_speed_limit = self._number(
            raw_data.get("permanent_speed_limit_kmph"),
            scheduled_speed
        )

        temporary_speed_restriction = self._number(
            raw_data.get("temporary_speed_restriction_kmph"),
            permanent_speed_limit
        )

        scheduled_travel_time = self._number(
            raw_data.get("scheduled_travel_time_min"),
            (
                distance_km / scheduled_speed * 60
                if scheduled_speed > 0
                else 0.0
            )
        )

        baseline_eta = self._number(
            raw_data.get("baseline_eta_min"),
            (
                distance_km / section_average_speed * 60
                if section_average_speed > 0
                else 0.0
            )
        )

        speed_deficit_ratio = (
            (scheduled_speed - current_speed) / scheduled_speed
            if scheduled_speed > 0
            else 0.0
        )

        speed_gap_from_schedule = (
            scheduled_speed - current_speed
        )

        speed_gap_from_section_avg = (
            section_average_speed - current_speed
        )

        speed_restriction_gap = (
            permanent_speed_limit - temporary_speed_restriction
        )

        low_visibility_flag = int(visibility < 5)
        severe_fog_flag = int(visibility < 2)
        dense_fog_flag = int(visibility < 1)

        visibility_penalty = max(0.0, 5.0 - visibility)
        fog_visibility_interaction = (
            visibility_penalty * severe_fog_flag
        )

        heavy_rain_flag = int(rainfall > 10)
        rain_penalty = max(0.0, rainfall - 10.0)

        combined_weather_penalty = (
            visibility_penalty + rain_penalty
        )

        weather_risk_index = (
            visibility_penalty
            + rain_penalty
            + (humidity / 100.0)
        )

        weather_congestion_interaction = (
            weather_risk_index * congestion
        )

        congestion_delay_pressure = (
            congestion * max(current_delay, 0.0)
        )

        close_train_ahead_flag = int(
            self._number(
                raw_data.get("distance_to_train_ahead_km"),
                999.0
            ) < 2.0
        )

        is_weekend = int(now.weekday() >= 5)

        is_peak_hour = int(
            now.hour in [7, 8, 9, 17, 18, 19, 20]
        )

        derived_features = {
            "train_type": self._text(
                raw_data.get("train_type"),
                "express"
            ),
            "hour": now.hour,
            "day_of_week": now.weekday(),
            "month": now.month,
            "route_segment_id": self._text(
                raw_data.get("route_segment_id"),
                f"{current_station}_{next_station}"
            ),
            "current_station": current_station,
            "next_station": next_station,
            "distance_to_next_station_km": distance_km,
            "current_speed_kmph": current_speed,
            "scheduled_speed_kmph": scheduled_speed,
            "section_average_speed_kmph": section_average_speed,
            "current_delay_min": current_delay,
            "trains_ahead": self._number(
                raw_data.get("trains_ahead")
            ),
            "distance_to_train_ahead_km": self._number(
                raw_data.get("distance_to_train_ahead_km"),
                999.0
            ),
            "headway_min": self._number(
                raw_data.get("headway_min")
            ),
            "block_signal_status": self._text(
                raw_data.get("block_signal_status"),
                "clear"
            ),
            "block_occupied": self._number(
                raw_data.get("block_occupied")
            ),
            "track_congestion": congestion,
            "weather": weather,
            "fog_index": self._number(
                raw_data.get("fog_index")
            ),
            "visibility_km": visibility,
            "rainfall_mm": rainfall,
            "temperature_c": temperature,
            "humidity_percent": humidity,
            "track_gradient_percent": self._number(
                raw_data.get("track_gradient_percent")
            ),
            "permanent_speed_limit_kmph": permanent_speed_limit,
            "temporary_speed_restriction_kmph": temporary_speed_restriction,
            "maintenance_block": self._number(
                raw_data.get("maintenance_block")
            ),
            "level_crossing_status": self._text(
                raw_data.get("level_crossing_status"),
                "normal"
            ),
            "unscheduled_stop": self._number(
                raw_data.get("unscheduled_stop")
            ),
            "station_halt_expected_min": self._number(
                raw_data.get("station_halt_expected_min")
            ),
            "priority_level": self._number(
                raw_data.get("priority_level")
            ),
            "historical_segment_delay_min": self._number(
                raw_data.get("historical_segment_delay_min")
            ),
            "historical_segment_time_min": self._number(
                raw_data.get("historical_segment_time_min")
            ),
            "previous_train_delay_min": self._number(
                raw_data.get("previous_train_delay_min")
            ),
            "scheduled_travel_time_min": scheduled_travel_time,
            "baseline_eta_min": baseline_eta,
            "current_station_name": current_station,
            "next_station_name": next_station,
            "current_station_lat": self._number(
                raw_data.get("current_station_lat"),
                raw_data.get("latitude", 0.0)
            ),
            "current_station_lon": self._number(
                raw_data.get("current_station_lon"),
                raw_data.get("longitude", 0.0)
            ),
            "next_station_lat": self._number(
                raw_data.get("next_station_lat")
            ),
            "next_station_lon": self._number(
                raw_data.get("next_station_lon")
            ),
            "geo_distance_to_next_km": self._number(
                raw_data.get("geo_distance_to_next_km"),
                distance_km
            ),
            "visibility_km_weather": visibility,
            "fog_index_weather": self._number(
                raw_data.get("fog_index")
            ),
            "rainfall_mm_weather": rainfall,
            "temperature_c_weather": temperature,
            "humidity_percent_weather": humidity,
            "schedule_next_station": next_station,
            "schedule_station_halt_expected_min": self._number(
                raw_data.get("schedule_station_halt_expected_min")
            ),
            "schedule_scheduled_travel_time_min": scheduled_travel_time,
            "schedule_baseline_eta_min": baseline_eta,
            "route_segment_id_network": self._text(
                raw_data.get("route_segment_id_network"),
                f"{current_station}_{next_station}"
            ),
            "distance_to_next_station_km_network": distance_km,
            "section_average_speed_kmph_network": section_average_speed,
            "track_congestion_network": congestion,
            "weather_risk_index": weather_risk_index,
            "speed_deficit_ratio": speed_deficit_ratio,
            "hour_of_day": now.hour,
            "is_weekend": is_weekend,
            "is_peak_hour": is_peak_hour,
            "distance_geo_gap_km": self._number(
                raw_data.get("distance_geo_gap_km")
            ),
            "low_visibility_flag": low_visibility_flag,
            "severe_fog_flag": severe_fog_flag,
            "dense_fog_flag": dense_fog_flag,
            "visibility_penalty_min": visibility_penalty,
            "fog_visibility_interaction": fog_visibility_interaction,
            "heavy_rain_flag": heavy_rain_flag,
            "rain_penalty_min": rain_penalty,
            "combined_weather_penalty_min": combined_weather_penalty,
            "weather_congestion_interaction": weather_congestion_interaction,
            "speed_gap_from_schedule_kmph": speed_gap_from_schedule,
            "speed_gap_from_section_avg_kmph": speed_gap_from_section_avg,
            "speed_restriction_gap_kmph": speed_restriction_gap,
            "congestion_delay_pressure": congestion_delay_pressure,
            "close_train_ahead_flag": close_train_ahead_flag,
            "day_of_week_from_timestamp": now.weekday(),
            "month_from_timestamp": now.month,
            "peak_hour_from_timestamp": is_peak_hour,
        }

        for column in self.feature_columns:
            features[column] = derived_features.get(
                column,
                raw_data.get(column, 0)
            )

        return pd.DataFrame(
            [features],
            columns=self.feature_columns
        )