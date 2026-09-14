from src.modules.weather.weather_service import weather_service
from src.modules.weather.weather_schemas import (
    WeatherData,
    WeatherFeatures,
)


class WeatherController:
    """
    Controller layer for weather-related operations.
    """

    def get_weather(self, location: str) -> WeatherData:
        return weather_service.get_weather(location)

    def get_weather_features(self, location: str) -> WeatherFeatures:
        return weather_service.get_weather_features(location)


weather_controller = WeatherController()