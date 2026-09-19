import React from "react";

import {
  Cloud,
  CloudRain,
  CloudSun,
  Droplets,
  Eye,
  Gauge,
  MapPin,
  Sun,
  Thermometer,
  Wind,
} from "lucide-react";


const formatNumber = (
  value,
  decimals = 1
) => {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    Number.isNaN(Number(value))
  ) {
    return "--";
  }

  return Number(value).toFixed(
    decimals
  );
};


const getWeatherIcon = (
  condition
) => {
  const normalized =
    String(condition || "")
      .toLowerCase();

  if (
    normalized.includes("thunder") ||
    normalized.includes("heavy rain") ||
    normalized.includes("rain") ||
    normalized.includes("drizzle")
  ) {
    return (
      <CloudRain
        size={22}
        className="text-blue-600"
      />
    );
  }

  if (
    normalized.includes("cloud") ||
    normalized.includes("overcast")
  ) {
    return (
      <CloudSun
        size={22}
        className="text-slate-600"
      />
    );
  }

  if (
    normalized.includes("fog")
  ) {
    return (
      <Cloud
        size={22}
        className="text-slate-500"
      />
    );
  }

  return (
    <Sun
      size={22}
      className="text-amber-500"
    />
  );
};


const getWeatherSeverity = (
  weather
) => {
  const rainfall =
    Number(
      weather?.rainfall_mm
    ) || 0;

  const wind =
    Number(
      weather?.wind_speed_kmph
    ) || 0;

  const visibility =
    Number(
      weather?.visibility_km
    ) || 10;

  const condition =
    String(
      weather?.condition || ""
    ).toLowerCase();


  let score = 0;


  if (rainfall > 0) {
    score += Math.min(
      rainfall / 10,
      3
    );
  }


  if (wind > 30) {
    score += 1;
  }


  if (visibility < 5) {
    score += 2;
  } else if (
    visibility < 8
  ) {
    score += 1;
  }


  if (
    [
      "heavy rain",
      "thunderstorm",
      "fog",
      "storm",
    ].includes(condition)
  ) {
    score += 2;
  }


  if (score >= 4) {
    return {
      label: "Severe",
      badge:
        "bg-red-50 text-red-700 border-red-100",
    };
  }


  if (score >= 2) {
    return {
      label: "Moderate",
      badge:
        "bg-orange-50 text-orange-700 border-orange-100",
    };
  }


  return {
    label: "Favorable",
    badge:
      "bg-green-50 text-green-700 border-green-100",
  };
};


const WeatherMetric = ({
  icon,
  label,
  value,
}) => {
  return (
    <div className="flex items-center gap-2">
      <div className="shrink-0">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[9px] text-slate-400">
          {label}
        </p>

        <p className="text-[11px] font-semibold text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
};


const WeatherCards = ({
  weather = [],
  loading = false,
  error = "",
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">
            <CloudSun
              size={20}
              className="text-blue-600"
            />
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900">
              Weather Along Route
            </h2>

            <p className="text-[10px] text-slate-400 mt-0.5">
              Live weather conditions from Open-Meteo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />

          <span className="text-[9px] font-semibold text-slate-500">
            LIVE
          </span>
        </div>
      </div>


      {/* Loading */}
      {loading && (
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5].map(
              (item) => (
                <div
                  key={item}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-4 animate-pulse"
                >
                  <div className="h-4 w-28 bg-slate-200 rounded" />

                  <div className="h-7 w-20 bg-slate-200 rounded mt-4" />

                  <div className="grid grid-cols-2 gap-3 mt-5">
                    <div className="h-8 bg-slate-200 rounded" />
                    <div className="h-8 bg-slate-200 rounded" />
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}


      {/* Error */}
      {!loading &&
        error && (
          <div className="p-5">
            <div className="rounded-xl border border-orange-100 bg-orange-50 p-4">
              <p className="text-sm font-semibold text-orange-700">
                Weather data unavailable
              </p>

              <p className="text-[11px] text-orange-600 mt-1">
                {error}
              </p>
            </div>
          </div>
        )}


      {/* No data */}
      {!loading &&
        !error &&
        weather.length === 0 && (
          <div className="p-6 text-center">
            <Cloud
              size={28}
              className="mx-auto text-slate-300"
            />

            <p className="text-sm text-slate-500 mt-2">
              No weather data available.
            </p>
          </div>
        )}


      {/* Weather cards */}
      {!loading &&
        !error &&
        weather.length > 0 && (
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {weather.map(
                (item, index) => {
                  const severity =
                    getWeatherSeverity(
                      item
                    );

                  return (
                    <div
                      key={
                        `${item.location}-${index}`
                      }
                      className="rounded-xl border border-slate-200 bg-white p-4 hover:border-blue-200 transition"
                    >
                      {/* Card header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                            {getWeatherIcon(
                              item.condition
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <MapPin
                                size={10}
                                className="text-slate-400"
                              />

                              <p className="text-[12px] font-bold text-slate-900 truncate">
                                {item.location}
                              </p>
                            </div>

                            <p className="text-[9px] text-slate-400 mt-0.5">
                              Route weather
                            </p>
                          </div>
                        </div>

                        <span
                          className={`px-2 py-1 rounded-full border text-[8px] font-bold whitespace-nowrap ${severity.badge}`}
                        >
                          {severity.label}
                        </span>
                      </div>


                      {/* Main condition */}
                      <div className="mt-4 flex items-end justify-between">
                        <div>
                          <p className="text-[10px] text-slate-400">
                            Current condition
                          </p>

                          <p className="text-sm font-bold text-slate-800 mt-1">
                            {item.condition ||
                              "--"}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-700">
                            {formatNumber(
                              item.temperature_c,
                              1
                            )}
                            °
                          </p>

                          <p className="text-[9px] text-slate-400">
                            Temperature
                          </p>
                        </div>
                      </div>


                      {/* Metrics */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-5 pt-4 border-t border-slate-100">
                        <WeatherMetric
                          icon={
                            <Droplets
                              size={15}
                              className="text-blue-500"
                            />
                          }
                          label="Rainfall"
                          value={`${formatNumber(
                            item.rainfall_mm,
                            1
                          )} mm`}
                        />

                        <WeatherMetric
                          icon={
                            <Wind
                              size={15}
                              className="text-slate-500"
                            />
                          }
                          label="Wind"
                          value={`${formatNumber(
                            item.wind_speed_kmph,
                            1
                          )} km/h`}
                        />

                        <WeatherMetric
                          icon={
                            <Eye
                              size={15}
                              className="text-purple-500"
                            />
                          }
                          label="Visibility"
                          value={`${formatNumber(
                            item.visibility_km,
                            1
                          )} km`}
                        />

                        <WeatherMetric
                          icon={
                            <Gauge
                              size={15}
                              className="text-orange-500"
                            />
                          }
                          label="Humidity"
                          value={`${formatNumber(
                            item.humidity_percent,
                            0
                          )}%`}
                        />
                      </div>


                      {/* Weather → ETA relevance */}
                      <div className="mt-4 rounded-lg bg-slate-50 px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Thermometer
                            size={13}
                            className="text-blue-500"
                          />

                          <p className="text-[9px] text-slate-500">
                            Weather conditions are used as an ETA model input.
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        )}
    </div>
  );
};


export default WeatherCards;