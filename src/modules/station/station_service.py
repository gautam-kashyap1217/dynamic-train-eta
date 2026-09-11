from src.modules.station.station_repository import station_repository


class StationService:
    """
    Business logic for station-related operations.
    """

    def get_all_stations(self):
        return station_repository.get_all_stations()

    def get_station_by_code(self, station_code: str):
        return station_repository.get_station_by_code(station_code)


station_service = StationService()