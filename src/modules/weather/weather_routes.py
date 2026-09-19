from typing import List

from fastapi import APIRouter, HTTPException, Query

from src.modules.weather.weather_controller import (
    weather_controller
)


router = APIRouter(
    prefix="/weather",
    tags=["Weather"],
)


@router.get("/route")
def get_route_weather(
    locations: List[str] = Query(...)
):
    """
    Get current Open-Meteo weather for multiple
    railway route stations.

    Example:

    /weather/route?locations=MTJ&locations=AGC&locations=DHO
    """

    try:
        weather = weather_controller.get_route_weather(
            locations
        )

        return {
            "success": True,
            "count": len(weather),
            "data": [
                item.model_dump()
                for item in weather
            ],
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to fetch route weather: "
                f"{str(error)}"
            ),
        )


@router.get("/{location}/features")
def get_weather_features(
    location: str
):
    try:
        features = (
            weather_controller.get_weather_features(
                location
            )
        )

        return {
            "success": True,
            "data": features.model_dump(),
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to generate weather features: "
                f"{str(error)}"
            ),
        )


@router.get("/{location}")
def get_weather(
    location: str
):
    try:
        weather = (
            weather_controller.get_weather(
                location
            )
        )

        return {
            "success": True,
            "data": weather.model_dump(),
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to fetch weather data: "
                f"{str(error)}"
            ),
        )