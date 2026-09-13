import json
import pandas as pd

from src.config.paths import (
    STATIONS_GEOJSON_PATH,
    STATION_NAMES_PATH
)


class StationRepository:
    """
    Repository layer for station data.

    station_full_names.csv:
        station_code
        station_name

    prototype_stations.geojson:
        station coordinates
    """

    def __init__(self):
        self._station_names_df = None
        self._geojson_data = None

    def _load_station_names(self):
        if self._station_names_df is None:

            if not STATION_NAMES_PATH.exists():
                return None

            self._station_names_df = pd.read_csv(
                STATION_NAMES_PATH
            )

        return self._station_names_df

    def search_stations_by_name(self, name: str):
        stations = self.get_all_stations()

        if not name:
            return stations

        name = name.strip().lower()

        return [
            station
            for station in stations
            if name in station["station_name"].lower()
        ]

    def _load_geojson(self):
        if self._geojson_data is None:

            if not STATIONS_GEOJSON_PATH.exists():
                return None

            with open(
                STATIONS_GEOJSON_PATH,
                "r",
                encoding="utf-8"
            ) as file:
                self._geojson_data = json.load(file)

        return self._geojson_data

    def get_all_stations(self):
        """
        Get all stations with their coordinates.
        """

        station_names = self._load_station_names()
        geojson = self._load_geojson()

        if station_names is None or geojson is None:
            return []

        # --------------------------------
        # Create station coordinate lookup
        # --------------------------------

        coordinates = {}

        for feature in geojson.get("features", []):

            properties = feature.get("properties", {})
            geometry = feature.get("geometry", {})

            station_code = properties.get("station_code")
            coords = geometry.get("coordinates")

            if station_code and coords:

                coordinates[station_code] = {
                    "longitude": coords[0],
                    "latitude": coords[1]
                }

        # --------------------------------
        # Combine name + coordinates
        # --------------------------------

        stations = []

        for _, row in station_names.iterrows():

            station_code = str(
                row["station_code"]
            ).strip()

            station = {
                "station_code": station_code,
                "station_name": str(
                    row["station_name"]
                ).strip(),
                "latitude": None,
                "longitude": None
            }

            if station_code in coordinates:

                station["latitude"] = coordinates[
                    station_code
                ]["latitude"]

                station["longitude"] = coordinates[
                    station_code
                ]["longitude"]

            stations.append(station)

        return stations

    def get_station_by_code(self, station_code: str):
        """
        Get a single station using station code.
        """

        stations = self.get_all_stations()

        station_code = station_code.strip().upper()

        for station in stations:

            if station["station_code"].upper() == station_code:
                return station

        return None


station_repository = StationRepository()