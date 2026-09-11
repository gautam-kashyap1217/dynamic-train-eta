from fastapi import APIRouter, HTTPException

from src.modules.station.station_service import station_service


router = APIRouter(
    prefix="/api/v1/stations",
    tags=["Stations"]
)


@router.get("/")
def get_stations():
    """
    Get all stations.
    """

    stations = station_service.get_all_stations()

    return {
        "status": "success",
        "count": len(stations),
        "stations": stations
    }


@router.get("/{station_code}")
def get_station(station_code: str):
    """
    Get station details by station code.
    """

    station = station_service.get_station_by_code(station_code)

    if station is None:
        raise HTTPException(
            status_code=404,
            detail=f"Station {station_code} not found"
        )

    return {
        "status": "success",
        "station": station
    }