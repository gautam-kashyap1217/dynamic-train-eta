from datetime import datetime, timedelta
from typing import Dict, List
from urllib.parse import urlencode
from urllib.request import Request, urlopen
import json


class WeatherRepository:
    """
    Weather data repository.

    Uses Open-Meteo for current weather data.

    The repository supports:
    - Individual station weather lookup
    - Batch route weather lookup
    - Five-minute in-memory caching
    - Station-name/code normalization

    No API key is required for the Open-Meteo public endpoint.
    """

    OPEN_METEO_URL = (
        "https://api.open-meteo.com/v1/forecast"
    )

    CACHE_DURATION = timedelta(minutes=5)

    # Coordinates for the stations used by the prototype.
    #
    # These are station-area coordinates rather than precise
    # railway-platform coordinates. They are sufficient for
    # route-level weather estimation.
    STATION_COORDINATES = {
        "NDLS": {
            "location": "New Delhi",
            "latitude": 28.6431,
            "longitude": 77.2197,
        },
        "NEW DELHI": {
            "location": "New Delhi",
            "latitude": 28.6431,
            "longitude": 77.2197,
        },
        "MATHURA": {
            "location": "Mathura Jn",
            "latitude": 27.4924,
            "longitude": 77.6737,
        },
        "MATHURA JN": {
            "location": "Mathura Jn",
            "latitude": 27.4924,
            "longitude": 77.6737,
        },
        "MTJ": {
            "location": "Mathura Jn",
            "latitude": 27.4924,
            "longitude": 77.6737,
        },
        "AGRA": {
            "location": "Agra Cantt",
            "latitude": 27.1603,
            "longitude": 77.9956,
        },
        "AGRA CANTT": {
            "location": "Agra Cantt",
            "latitude": 27.1603,
            "longitude": 77.9956,
        },
        "AGC": {
            "location": "Agra Cantt",
            "latitude": 27.1603,
            "longitude": 77.9956,
        },
        "DHAULPUR": {
            "location": "Dhaulpur",
            "latitude": 26.7025,
            "longitude": 77.8934,
        },
        "DHAULPUR JN": {
            "location": "Dhaulpur",
            "latitude": 26.7025,
            "longitude": 77.8934,
        },
        "DHO": {
            "location": "Dhaulpur",
            "latitude": 26.7025,
            "longitude": 77.8934,
        },
        "MORENA": {
            "location": "Morena",
            "latitude": 26.4947,
            "longitude": 77.9956,
        },
        "MRA": {
            "location": "Morena",
            "latitude": 26.4947,
            "longitude": 77.9956,
        },
        "LALITPUR": {
            "location": "Lalitpur",
            "latitude": 24.6901,
            "longitude": 78.4129,
        },
        "LAR": {
            "location": "Lalitpur",
            "latitude": 24.6901,
            "longitude": 78.4129,
        },
    }

    def __init__(self):
        self._cache: Dict[str, Dict] = {}
        self._cache_time: Dict[str, datetime] = {}

    @staticmethod
    def _normalize_location(location: str) -> str:
        return (
            str(location)
            .strip()
            .upper()
        )

    def _resolve_station(
        self,
        location: str
    ) -> Dict:
        normalized = self._normalize_location(
            location
        )

        station = self.STATION_COORDINATES.get(
            normalized
        )

        if station is None:
            raise ValueError(
                f"Weather coordinates are not configured "
                f"for station: {location}"
            )

        return station

    @staticmethod
    def _weather_code_to_condition(
        weather_code
    ) -> str:
        """
        Convert Open-Meteo WMO weather codes into
        human-readable conditions.
        """

        try:
            code = int(weather_code)
        except (TypeError, ValueError):
            return "Unknown"

        if code == 0:
            return "Clear"

        if code in {1, 2}:
            return "Partly Cloudy"

        if code == 3:
            return "Overcast"

        if code in {45, 48}:
            return "Fog"

        if code in {51, 53, 55}:
            return "Drizzle"

        if code in {56, 57}:
            return "Freezing Drizzle"

        if code in {61, 63}:
            return "Rain"

        if code == 65:
            return "Heavy Rain"

        if code in {66, 67}:
            return "Freezing Rain"

        if code in {71, 73, 75, 77}:
            return "Snow"

        if code in {80, 81}:
            return "Rain Showers"

        if code == 82:
            return "Heavy Rain Showers"

        if code in {85, 86}:
            return "Snow Showers"

        if code in {95}:
            return "Thunderstorm"

        if code in {96, 99}:
            return "Thunderstorm"

        return "Unknown"

    def _get_cached(
        self,
        cache_key: str
    ):
        if cache_key not in self._cache:
            return None

        cached_at = self._cache_time.get(
            cache_key
        )

        if cached_at is None:
            return None

        if (
            datetime.now() - cached_at
            > self.CACHE_DURATION
        ):
            self._cache.pop(
                cache_key,
                None
            )

            self._cache_time.pop(
                cache_key,
                None
            )

            return None

        print(
            f"Using cached Open-Meteo weather: "
            f"{cache_key}"
        )

        return self._cache[cache_key]

    def _set_cache(
        self,
        cache_key: str,
        value: Dict
    ):
        self._cache[cache_key] = value
        self._cache_time[cache_key] = datetime.now()

    def _fetch_open_meteo(
        self,
        latitude: float,
        longitude: float,
        location: str
    ) -> Dict:
        """
        Fetch current weather for one station.
        """

        query = urlencode({
            "latitude": latitude,
            "longitude": longitude,
            "current": ",".join([
                "temperature_2m",
                "relative_humidity_2m",
                "rain",
                "weather_code",
                "wind_speed_10m",
                "visibility",
            ]),
            "timezone": "auto",
        })

        url = (
            f"{self.OPEN_METEO_URL}"
            f"?{query}"
        )

        request = Request(
            url,
            headers={
                "User-Agent": (
                    "DynamicTrainETA/1.0"
                )
            }
        )

        print(
            f"Fetching Open-Meteo weather: "
            f"{location}"
        )

        with urlopen(
            request,
            timeout=10
        ) as response:

            payload = json.loads(
                response.read().decode("utf-8")
            )

        current = payload.get(
            "current",
            {}
        )

        temperature = float(
            current.get(
                "temperature_2m",
                0.0
            )
        )

        humidity = float(
            current.get(
                "relative_humidity_2m",
                0.0
            )
        )

        rainfall = float(
            current.get(
                "rain",
                0.0
            )
        )

        wind_speed = float(
            current.get(
                "wind_speed_10m",
                0.0
            )
        )

        visibility_m = float(
            current.get(
                "visibility",
                10000.0
            )
        )

        visibility_km = (
            visibility_m / 1000.0
        )

        condition = (
            self._weather_code_to_condition(
                current.get(
                    "weather_code"
                )
            )
        )

        weather_data = {
            "location": location,
            "temperature_c": round(
                temperature,
                2
            ),
            "rainfall_mm": round(
                max(rainfall, 0.0),
                2
            ),
            "wind_speed_kmph": round(
                max(wind_speed, 0.0),
                2
            ),
            "visibility_km": round(
                max(visibility_km, 0.0),
                2
            ),
            "humidity_percent": round(
                min(
                    max(humidity, 0.0),
                    100.0
                ),
                2
            ),
            "condition": condition,
        }

        print(
            "Open-Meteo weather retrieved:",
            weather_data
        )

        return weather_data

    def get_weather(
        self,
        location: str
    ) -> Dict:
        """
        Fetch weather for a single station.
        """

        station = self._resolve_station(
            location
        )

        canonical_location = station[
            "location"
        ]

        cached = self._get_cached(
            canonical_location
        )

        if cached is not None:
            return cached.copy()

        try:
            weather_data = (
                self._fetch_open_meteo(
                    latitude=station["latitude"],
                    longitude=station["longitude"],
                    location=canonical_location
                )
            )

            self._set_cache(
                canonical_location,
                weather_data
            )

            return weather_data.copy()

        except Exception as error:
            print(
                "Open-Meteo request failed:",
                error
            )

            raise

    def get_route_weather(
        self,
        locations: List[str]
    ) -> List[Dict]:
        """
        Fetch weather for multiple route stations.

        The stations are requested together from Open-Meteo
        using comma-separated coordinates so the frontend can
        load all weather cards with one backend request.
        """

        if not locations:
            return []

        resolved_stations = []

        for location in locations:
            try:
                station = self._resolve_station(
                    location
                )

                resolved_stations.append(
                    station
                )

            except ValueError as error:
                print(error)

        if not resolved_stations:
            return []

        results = []

        uncached_stations = []

        for station in resolved_stations:
            canonical_location = station[
                "location"
            ]

            cached = self._get_cached(
                canonical_location
            )

            if cached is not None:
                results.append(
                    cached.copy()
                )
            else:
                uncached_stations.append(
                    station
                )

        if uncached_stations:

            latitudes = ",".join(
                str(station["latitude"])
                for station in uncached_stations
            )

            longitudes = ",".join(
                str(station["longitude"])
                for station in uncached_stations
            )

            query = urlencode({
                "latitude": latitudes,
                "longitude": longitudes,
                "current": ",".join([
                    "temperature_2m",
                    "relative_humidity_2m",
                    "rain",
                    "weather_code",
                    "wind_speed_10m",
                    "visibility",
                ]),
                "timezone": "auto",
            })

            url = (
                f"{self.OPEN_METEO_URL}"
                f"?{query}"
            )

            request = Request(
                url,
                headers={
                    "User-Agent": (
                        "DynamicTrainETA/1.0"
                    )
                }
            )

            print(
                "Fetching Open-Meteo weather "
                f"for {len(uncached_stations)} stations "
                "in one request."
            )

            try:
                with urlopen(
                    request,
                    timeout=10
                ) as response:

                    payload = json.loads(
                        response.read().decode(
                            "utf-8"
                        )
                    )

                # Open-Meteo returns a list when
                # multiple coordinates are requested.
                if isinstance(
                    payload,
                    dict
                ):
                    payloads = [payload]
                else:
                    payloads = payload

                for station, station_payload in zip(
                    uncached_stations,
                    payloads
                ):

                    current = station_payload.get(
                        "current",
                        {}
                    )

                    visibility_km = (
                        float(
                            current.get(
                                "visibility",
                                10000.0
                            )
                        ) / 1000.0
                    )

                    weather_data = {
                        "location": station[
                            "location"
                        ],
                        "temperature_c": round(
                            float(
                                current.get(
                                    "temperature_2m",
                                    0.0
                                )
                            ),
                            2
                        ),
                        "rainfall_mm": round(
                            max(
                                float(
                                    current.get(
                                        "rain",
                                        0.0
                                    )
                                ),
                                0.0
                            ),
                            2
                        ),
                        "wind_speed_kmph": round(
                            max(
                                float(
                                    current.get(
                                        "wind_speed_10m",
                                        0.0
                                    )
                                ),
                                0.0
                            ),
                            2
                        ),
                        "visibility_km": round(
                            max(
                                visibility_km,
                                0.0
                            ),
                            2
                        ),
                        "humidity_percent": round(
                            min(
                                max(
                                    float(
                                        current.get(
                                            "relative_humidity_2m",
                                            0.0
                                        )
                                    ),
                                    0.0
                                ),
                                100.0
                            ),
                            2
                        ),
                        "condition":
                            self._weather_code_to_condition(
                                current.get(
                                    "weather_code"
                                )
                            ),
                    }

                    self._set_cache(
                        station["location"],
                        weather_data
                    )

                    results.append(
                        weather_data
                    )

                    print(
                        "Route weather retrieved:",
                        weather_data
                    )

            except Exception as error:
                print(
                    "Batch Open-Meteo request failed:",
                    error
                )

                raise

        # Preserve the order requested by the frontend.
        result_map = {
            item["location"]: item
            for item in results
        }

        ordered_results = []

        for station in resolved_stations:
            item = result_map.get(
                station["location"]
            )

            if item:
                ordered_results.append(
                    item.copy()
                )

        return ordered_results


weather_repository = WeatherRepository()