from src.modules.weather.weather_repository import weather_repository
from src.modules.weather.weather_schemas import (
    WeatherData,
    WeatherFeatures,
)


class WeatherService:
    """
    Handles weather data and converts it into ML-ready features.
    """

    def get_weather(self, location: str) -> WeatherData:
        weather_data = weather_repository.get_weather(location)
        return WeatherData(**weather_data)

    def get_weather_features(self, location: str) -> WeatherFeatures:
        weather = self.get_weather(location)

        severity = 0.0

        if weather.rainfall_mm > 0:
            severity += min(weather.rainfall_mm / 10, 3)

        if weather.wind_speed_kmph > 30:
            severity += 1.0

        if weather.visibility_km < 5:
            severity += 2.0
        elif weather.visibility_km < 8:
            severity += 1.0

        if weather.condition.lower() in {
            "heavy rain",
            "thunderstorm",
            "fog",
            "storm",
        }:
            severity += 2.0

        return WeatherFeatures(
            temperature_c=weather.temperature_c,
            rainfall_mm=weather.rainfall_mm,
            wind_speed_kmph=weather.wind_speed_kmph,
            visibility_km=weather.visibility_km,
            humidity_percent=weather.humidity_percent,
            weather_severity=round(severity, 2),
        )


weather_service = WeatherService()