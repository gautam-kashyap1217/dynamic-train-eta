const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8000";


const ROUTE_WEATHER_STATIONS = [
  "MTJ",
  "AGC",
  "DHO",
  "MRA",
  "LAR",
];


export const getRouteWeather = async (
  locations = ROUTE_WEATHER_STATIONS
) => {
  const params = new URLSearchParams();

  locations.forEach((location) => {
    params.append(
      "locations",
      location
    );
  });

  const response = await fetch(
    `${API_BASE_URL}/weather/route?${params.toString()}`
  );

  if (!response.ok) {
    let errorMessage =
      "Unable to fetch route weather.";

    try {
      const errorData =
        await response.json();

      errorMessage =
        errorData?.detail ||
        errorMessage;
    } catch {
      // Keep default error message.
    }

    throw new Error(
      errorMessage
    );
  }

  const result =
    await response.json();

  if (
    !result ||
    result.success !== true
  ) {
    throw new Error(
      "Invalid weather response received from server."
    );
  }

  return Array.isArray(result.data)
    ? result.data
    : [];
};