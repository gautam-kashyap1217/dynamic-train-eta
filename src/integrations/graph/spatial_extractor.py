import json
import math
from src.config.paths import STATIONS_GEOJSON_PATH


class SpatialExtractor:
    """Extracts station coordinates and calculates geographic distances."""

    def __init__(self):
        self.stations = {}
        self._load_stations()

    def _load_stations(self):
        if not STATIONS_GEOJSON_PATH.exists():
            raise FileNotFoundError(
                f"Station GeoJSON not found: {STATIONS_GEOJSON_PATH}"
            )

        with open(STATIONS_GEOJSON_PATH, "r", encoding="utf-8") as file:
            data = json.load(file)

        for feature in data.get("features", []):
            properties = feature.get("properties", {})
            geometry = feature.get("geometry", {})

            station = properties.get("station") or properties.get("station_code")
            coordinates = geometry.get("coordinates", [])

            if station and len(coordinates) >= 2:
                self.stations[station] = {
                    "longitude": float(coordinates[0]),
                    "latitude": float(coordinates[1]),
                }

    def get_coordinates(self, station: str):
        """Return latitude and longitude for a station."""
        return self.stations.get(station)

    def calculate_distance_km(self, source: str, target: str) -> float:
        """Calculate straight-line geographic distance between two stations."""

        source_coords = self.get_coordinates(source)
        target_coords = self.get_coordinates(target)

        if not source_coords or not target_coords:
            return 0.0

        lat1 = math.radians(source_coords["latitude"])
        lon1 = math.radians(source_coords["longitude"])
        lat2 = math.radians(target_coords["latitude"])
        lon2 = math.radians(target_coords["longitude"])

        dlat = lat2 - lat1
        dlon = lon2 - lon1

        a = (
            math.sin(dlat / 2) ** 2
            + math.cos(lat1)
            * math.cos(lat2)
            * math.sin(dlon / 2) ** 2
        )

        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

        return 6371.0 * c


spatial_extractor = SpatialExtractor()