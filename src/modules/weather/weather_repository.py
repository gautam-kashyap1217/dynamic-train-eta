from typing import Dict


class WeatherRepository:
    """
    Provides local/mock weather data.
    No external API request is made here.
    """

    def get_weather(self, location: str) -> Dict:
        weather_data = {
            "NDLS": {
                "location": "Delhi",
                "temperature_c": 30.0,
                "rainfall_mm": 0.0,
                "wind_speed_kmph": 12.0,
                "visibility_km": 8.0,
                "humidity_percent": 55.0,
                "condition": "Clear",
            },
            "Mathura": {
                "location": "Mathura",
                "temperature_c": 29.0,
                "rainfall_mm": 1.0,
                "wind_speed_kmph": 15.0,
                "visibility_km": 7.0,
                "humidity_percent": 60.0,
                "condition": "Partly Cloudy",
            },
            "Bhopal": {
                "location": "Bhopal",
                "temperature_c": 27.0,
                "rainfall_mm": 5.0,
                "wind_speed_kmph": 20.0,
                "visibility_km": 5.0,
                "humidity_percent": 72.0,
                "condition": "Light Rain",
            },
        }

        return weather_data.get(
            location,
            {
                "location": location,
                "temperature_c": 28.0,
                "rainfall_mm": 0.0,
                "wind_speed_kmph": 10.0,
                "visibility_km": 10.0,
                "humidity_percent": 50.0,
                "condition": "Clear",
            },
        )


weather_repository = WeatherRepository()