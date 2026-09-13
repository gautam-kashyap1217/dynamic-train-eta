from fastapi import APIRouter, HTTPException
from src.modules.station.station_service import station_service

router = APIRouter(
    prefix="/api/v1/stations",
    tags=["Stations"]
)


@router.get("/")
def get_stations():
    stations = station_service.get_all_stations()

    return {
        "status": "success",
        "count": len(stations),
        "stations": stations
    }


@router.get("/search")
def search_stations(name: str = ""):
    stations = station_service.search_stations_by_name(name)

    return {
        "status": "success",
        "count": len(stations),
        "stations": stations
    }


@router.get("/{station_code}")
def get_station(station_code: str):
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