from datetime import datetime


class SignalCongestionNormalizer:
    """
    Converts RailRadar live response into the common
    format required by SignalCongestionCalculator.
    """

    def _get_train_data(self, response: dict) -> dict:
        """
        RailRadar response may contain data inside 'data'.
        """
        if not isinstance(response, dict):
            return {}

        return response.get("data", response)

    def _get_station_list(self, train_data: dict) -> list:
        """
        Extract route/station list from RailRadar response.
        """
        possible_keys = [
            "stations",
            "route",
            "schedule",
            "trainRoute"
        ]

        for key in possible_keys:
            value = train_data.get(key)

            if isinstance(value, list):
                return value

        return []

    def _get_current_station(self, stations: list):
        """
        Find current or most recently passed station.
        """
        for station in stations:
            if station.get("status") == "current":
                return station

        for station in stations:
            if station.get("status") == "running":
                return station

        # Fallback: last station having actual arrival
        passed_stations = [
            station
            for station in stations
            if station.get("actualArrival")
        ]

        if passed_stations:
            return passed_stations[-1]

        return None

    def _get_next_station(self, stations: list):
        """
        Find next upcoming station.
        """
        upcoming_stations = [
            station
            for station in stations
            if station.get("status") == "upcoming"
        ]

        if upcoming_stations:
            return upcoming_stations[0]

        return None

    def _safe_float(self, value, default=0.0):
        try:
            if value is None:
                return default

            return float(value)

        except (ValueError, TypeError):
            return default

    def normalize(self, response: dict) -> dict | None:
        """
        Convert RailRadar response into calculator input.
        """

        train_data = self._get_train_data(response)

        if not train_data:
            return None

        stations = self._get_station_list(train_data)

        if not stations:
            return None

        current_station = self._get_current_station(stations)
        next_station = self._get_next_station(stations)

        # Prefer next station speed, otherwise current station speed
        current_speed = 0.0

        if next_station:
            current_speed = self._safe_float(
                next_station.get("speedToNextStationKmph")
            )

        if current_speed == 0 and current_station:
            current_speed = self._safe_float(
                current_station.get("speedToNextStationKmph")
            )

        # Delay from current/last passed station
        current_delay = 0.0

        if current_station:
            current_delay = self._safe_float(
                current_station.get("delayDeparture")
                or current_station.get("delayArrival")
            )

        if current_delay == 0 and next_station:
            current_delay = self._safe_float(
                next_station.get("delayDeparture")
                or next_station.get("delayArrival")
            )

        # Distance to next station
        distance_to_next = 0.0

        if next_station:
            distance_to_next = self._safe_float(
                next_station.get("distance")
            )

        # Since RailRadar does not directly provide these fields,
        # use conservative derived/default values.
        trains_ahead = 0.0
        headway_min = 30.0

        # Estimate track congestion from speed and delay
        track_congestion = 0.0

        if current_delay >= 30:
            track_congestion = 0.85
        elif current_delay >= 15:
            track_congestion = 0.65
        elif current_delay >= 5:
            track_congestion = 0.40
        else:
            track_congestion = 0.20

        # Use a baseline speed if RailRadar speed is available
        section_average_speed = current_speed

        return {
            "distance_to_next_station_km": distance_to_next,
            "current_speed_kmph": current_speed,
            "scheduled_speed_kmph": current_speed,
            "section_average_speed_kmph": section_average_speed,
            "current_delay_min": current_delay,
            "trains_ahead": trains_ahead,
            "headway_min": headway_min,
            "track_congestion": track_congestion,
            "source": "railradar"
        }


signal_congestion_normalizer = SignalCongestionNormalizer()