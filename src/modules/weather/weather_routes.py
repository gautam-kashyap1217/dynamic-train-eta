from fastapi import APIRouter, HTTPException

from src.modules.weather.weather_controller import weather_controller


router = APIRouter(
    prefix="/weather",
    tags=["Weather"],
)


@router.get("/{location}/features")
def get_weather_features(location: str):
    try:
        features = weather_controller.get_weather_features(
            location
        )

        return {
            "success": True,
            "data": features.model_dump(),
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to generate weather features: {str(error)}",
        )


@router.get("/{location}")
def get_weather(location: str):
    try:
        weather = weather_controller.get_weather(
            location
        )

        return {
            "success": True,
            "data": weather.model_dump(),
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to fetch weather data: {str(error)}",
        )