import React, { useEffect, useState } from "react";

import {
  Cloud,
  CloudRain,
  CloudSun,
  Droplets,
  MapPin,
  Sun,
  Wind,
  Radio,
} from "lucide-react";

import { useLocation, useNavigate } from "react-router";

import LiveTrainHeader from "../components/LiveStatus/LiveTrainHeader";
import LiveStats from "../components/LiveStatus/LiveStats";
import RouteEtaTable from "../components/LiveStatus/RouteEtaTable";
import LiveRouteMap from "../components/LiveStatus/LiveRouteMap";
import DelayReason from "../components/LiveStatus/DelayReason";
import TrainOverview from "../components/LiveStatus/TrainOverview";
import QuickActions from "../components/LiveStatus/QuickActions";

import { getLiveTrainStatus } from "../services/liveStatusApi";



const WEATHER_STATIONS = [
  "MTJ",
  "AGC",
  "DHO",
  "MRA",
  "LAR",
];



const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8000";



/*
 * Live train status refresh interval.
 *
 * The frontend will request fresh train status
 * and ETA data from the backend every 15 seconds.
 */
const LIVE_REFRESH_INTERVAL = 15000;



const formatWeatherCondition = (
  condition
) => {
  if (!condition) {
    return "Unknown";
  }

  return condition;
};



const WeatherIcon = ({
  condition,
}) => {

  const normalized = String(
    condition || ""
  ).toLowerCase();

  if (
    normalized.includes("thunder") ||
    normalized.includes("heavy rain")
  ) {
    return (
      <CloudRain
        size={21}
        className="text-orange-500"
      />
    );
  }

  if (
    normalized.includes("rain") ||
    normalized.includes("drizzle")
  ) {
    return (
      <CloudRain
        size={21}
        className="text-blue-500"
      />
    );
  }

  if (
    normalized.includes("partly") ||
    normalized.includes("cloud")
  ) {
    return (
      <CloudSun
        size={21}
        className="text-amber-500"
      />
    );
  }

  if (
    normalized.includes("fog")
  ) {
    return (
      <Cloud
        size={21}
        className="text-slate-500"
      />
    );
  }

  return (
    <Sun
      size={21}
      className="text-yellow-500"
    />
  );
};



const WeatherCard = ({
  weather,
}) => {

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 min-w-0">

      <div className="flex items-start justify-between gap-3">

        <div className="min-w-0">

          <p className="text-xs font-bold text-slate-900 truncate">
            {weather.location}
          </p>

        </div>

        <div className="h-9 w-9 rounded-lg bg-slate-50 flex items-center justify-center shrink-0">

          <WeatherIcon
            condition={
              weather.condition
            }
          />

        </div>

      </div>



      <div className="mt-4">

        <p className="text-2xl font-bold text-slate-900">
          {Math.round(
            Number(
              weather.temperature_c
            )
          )}°C
        </p>

        <p className="text-[10px] font-semibold text-slate-500 mt-1">
          {formatWeatherCondition(
            weather.condition
          )}
        </p>

      </div>



      <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">

        <div className="flex items-center justify-between">

          <div className="flex items-center gap-1.5">

            <Droplets
              size={13}
              className="text-blue-500"
            />

            <span className="text-[10px] text-slate-500">
              Humidity
            </span>

          </div>

          <span className="text-[10px] font-bold text-slate-700">
            {weather.humidity_percent}%
          </span>

        </div>



        <div className="flex items-center justify-between">

          <div className="flex items-center gap-1.5">

            <CloudRain
              size={13}
              className="text-blue-500"
            />

            <span className="text-[10px] text-slate-500">
              Rain
            </span>

          </div>

          <span className="text-[10px] font-bold text-slate-700">
            {weather.rainfall_mm} mm
          </span>

        </div>



        <div className="flex items-center justify-between">

          <div className="flex items-center gap-1.5">

            <Wind
              size={13}
              className="text-slate-500"
            />

            <span className="text-[10px] text-slate-500">
              Wind
            </span>

          </div>

          <span className="text-[10px] font-bold text-slate-700">
            {weather.wind_speed_kmph} km/h
          </span>

        </div>

      </div>

    </div>
  );
};



const LiveStatus = () => {

  const navigate = useNavigate();

  const location = useLocation();

  const selectedTrain =
    location.state?.train;

  const trainNumber =
    typeof selectedTrain === "string"
      ? selectedTrain
      : selectedTrain?.number ||
        selectedTrain?.train_number ||
        "12951";



  const [data, setData] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");



  /*
   * Indicates that a background live refresh
   * is currently running.
   */
  const [isRefreshing, setIsRefreshing] =
    useState(false);



  /*
   * Stores the time when the frontend
   * last successfully received fresh
   * train data from the backend.
   */
  const [lastLiveRefresh, setLastLiveRefresh] =
    useState(null);



  const [routeWeather, setRouteWeather] =
    useState([]);

  const [weatherLoading, setWeatherLoading] =
    useState(true);

  const [weatherError, setWeatherError] =
    useState("");



  // =========================================================
  // LIVE TRAIN STATUS + ETA
  // =========================================================

  useEffect(() => {

    let isMounted = true;



    const loadLiveStatus = async (
      initialLoad = false
    ) => {

      try {

        /*
         * Initial page load shows the main loading screen.
         *
         * Background refreshes do NOT show the main
         * loading screen because that would make the
         * dashboard disappear every 15 seconds.
         */
        if (initialLoad) {

          setLoading(true);

        } else {

          setIsRefreshing(true);

        }



        setError("");



        const result =
          await getLiveTrainStatus(
            trainNumber
          );



        if (!result) {

          throw new Error(
            "No train data was returned by the server."
          );
        }



        if (!isMounted) {
          return;
        }



        const updatedData = {

          ...result,

          train: {

            ...(result.train || {}),

            ...(typeof selectedTrain === "object"
              ? selectedTrain
              : {}),

            number:
              result.train?.number ||
              result.train?.trainNumber ||
              trainNumber,

            name:
              result.train?.name ||
              result.train?.trainName ||
              selectedTrain?.name ||
              "Train",

            from:
              selectedTrain?.from ||
              location.state?.from ||
              result.train?.from ||
              "Origin",

            to:
              selectedTrain?.to ||
              location.state?.to ||
              result.train?.to ||
              "Destination",
          },



          live: {

            currentLocation:
              result.live?.currentLocation ||
              "Information unavailable",

            nextStation:
              result.live?.nextStation ||
              result.prediction?.nextStation ||
              "Information unavailable",

            distanceFromNextStation:
              result.live?.distanceFromNextStation ||
              "Distance unavailable",

            speed:
              result.live?.speed ??
              result.prediction?.speedKmph ??
              0,

            delay:
              result.live?.delay ??
              0,

            lastUpdated:
              result.live?.lastUpdated ||
              "Unavailable",

            etaUpdated:
              result.live?.etaUpdated ||
              "Unavailable",

            latitude:
              result.live?.latitude ??
              0,

            longitude:
              result.live?.longitude ??
              0,
          },



          stations:
            Array.isArray(
              result.stations
            )
              ? result.stations
              : [],



          prediction:
            result.prediction ||
            null,



          delayReason:
            result.delayReason ||
            null,



          weather:
            result.weather ||
            null,
        };



        /*
         * Replace the existing dashboard data with
         * the latest backend response.
         */
        setData(
          updatedData
        );



        /*
         * Record when the frontend successfully
         * received the latest live prediction.
         */
        setLastLiveRefresh(
          new Date()
        );



      } catch (err) {

        console.error(
          "Live status error:",
          err
        );



        /*
         * If the INITIAL request fails, show the
         * normal error screen.
         *
         * If a BACKGROUND refresh fails, keep the
         * existing dashboard visible.
         */
        if (initialLoad) {

          setError(
            err.message ||
            "Unable to load live train status."
          );

        }

      } finally {

        if (!isMounted) {
          return;
        }



        if (initialLoad) {

          setLoading(false);

        } else {

          setIsRefreshing(false);

        }

      }

    };



    /*
     * =====================================================
     * INITIAL REQUEST
     * =====================================================
     */

    loadLiveStatus(true);



    /*
     * =====================================================
     * CONTINUOUS LIVE REFRESH
     * =====================================================
     *
     * Every 15 seconds we request fresh train status
     * and ETA information.
     */

    const refreshTimer =
      setInterval(
        () => {
          loadLiveStatus(false);
        },
        LIVE_REFRESH_INTERVAL
      );



    /*
     * =====================================================
     * CLEANUP
     * =====================================================
     *
     * Prevent multiple intervals when the user leaves
     * the page or when the train number changes.
     */

    return () => {

      isMounted = false;

      clearInterval(
        refreshTimer
      );

    };



    // The selected train number is the trigger
    // for creating a new live-status session.

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trainNumber]);



  // =========================================================
  // ROUTE WEATHER
  // =========================================================

  useEffect(() => {

    const loadRouteWeather = async () => {

      try {

        setWeatherLoading(true);

        setWeatherError("");



        /*
         * FastAPI expects repeated query parameters:
         *
         * /weather/route
         * ?locations=MTJ
         * &locations=AGC
         * &locations=DHO
         * &locations=MRA
         * &locations=LAR
         *
         * URLSearchParams creates this correctly.
         */

        const params =
          new URLSearchParams();



        WEATHER_STATIONS.forEach(
          (station) => {

            params.append(
              "locations",
              station
            );

          }
        );



        const response =
          await fetch(
            `${API_BASE_URL}/weather/route?${params.toString()}`
          );



        if (!response.ok) {

          throw new Error(
            `Weather API returned ${response.status}`
          );

        }



        const result =
          await response.json();



        if (
          !result ||
          !Array.isArray(
            result.data
          )
        ) {

          throw new Error(
            "Invalid weather response."
          );

        }



        setRouteWeather(
          result.data
        );



      } catch (err) {

        console.error(
          "Route weather error:",
          err
        );



        setWeatherError(
          err.message ||
          "Unable to load route weather."
        );



      } finally {

        setWeatherLoading(false);

      }

    };



    loadRouteWeather();

  }, []);



  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">

        <div className="text-center">

          <div className="h-10 w-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />

          <p className="text-sm text-slate-500 mt-4">
            Loading train information...
          </p>

        </div>

      </div>
    );

  }



  // =========================================================
  // ERROR
  // =========================================================

  if (error || !data) {

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">

        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">

          <p className="text-red-500 font-semibold">
            {error ||
              "No train data available"}
          </p>



          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
          >
            Go Back
          </button>

        </div>

      </div>
    );

  }



  return (
    <div className="min-h-screen bg-slate-50">

      {/* Back Button */}

      <div className="max-w-[1480px] mx-auto px-6 pt-5">

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-sm text-slate-600 hover:text-blue-600"
        >
          ← Back
        </button>

      </div>



      <main className="max-w-[1480px] mx-auto px-6 py-4">

        {/* Existing Train Header */}

        <LiveTrainHeader
          train={data.train}
        />



        {/* =====================================================
            LIVE PREDICTION STATUS
            ===================================================== */}

        <div className="mt-3 flex items-center justify-between px-1">

          <div className="flex items-center gap-2">

            <div
              className={`h-2.5 w-2.5 rounded-full ${
                isRefreshing
                  ? "bg-amber-400 animate-pulse"
                  : "bg-emerald-500"
              }`}
            />



            <div className="flex items-center gap-1.5">

              <Radio
                size={13}
                className={
                  isRefreshing
                    ? "text-amber-500"
                    : "text-emerald-500"
                }
              />

              <span className="text-[11px] font-semibold text-slate-600">

                {isRefreshing
                  ? "Updating live prediction..."
                  : "Live prediction active"}

              </span>

            </div>

          </div>



          <span className="text-[10px] text-slate-400">

            {lastLiveRefresh
              ? `Last sync: ${lastLiveRefresh.toLocaleTimeString()}`
              : "Connecting..."}

          </span>

        </div>



        {/* Existing Live Statistics */}

        <div className="mt-2">

          <LiveStats
            live={data.live}
            prediction={data.prediction}
          />

        </div>



        {/* =====================================================
            EXISTING TWO-COLUMN UI
            DO NOT CHANGE
            ===================================================== */}

        <div className="grid grid-cols-[1.4fr_1fr] gap-4 mt-4">

          {/* LEFT */}

          <RouteEtaTable
            stations={data.stations}
            prediction={data.prediction}
          />



          {/* RIGHT */}

          <div className="space-y-4">

            <LiveRouteMap
              train={data.train}
              live={data.live}
              stations={data.stations}
            />



            <DelayReason
              delayReason={data.delayReason}
            />



            <TrainOverview
              train={data.train}
              live={data.live}
              prediction={data.prediction}
            />



            <QuickActions
              weather={data.weather}
              prediction={data.prediction}
            />

          </div>

        </div>



        {/* =====================================================
            WEATHER ALONG ROUTE
            SEPARATE NEW SECTION
            ===================================================== */}

        <div className="mt-4 bg-white rounded-2xl border border-slate-200 overflow-hidden">

          <div className="px-5 py-4 border-b border-slate-100">

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

          </div>



          <div className="p-4">

            {weatherLoading && (

              <div className="py-8 text-center">

                <div className="h-7 w-7 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />

                <p className="text-xs text-slate-500 mt-3">
                  Loading route weather...
                </p>

              </div>

            )}



            {!weatherLoading &&
              weatherError && (

                <div className="py-6 text-center">

                  <p className="text-sm font-semibold text-red-500">
                    Weather unavailable
                  </p>

                  <p className="text-[10px] text-slate-400 mt-1">
                    {weatherError}
                  </p>

                </div>

              )}



            {!weatherLoading &&
              !weatherError &&
              routeWeather.length > 0 && (

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">

                  {routeWeather.map(
                    (weather) => (

                      <WeatherCard
                        key={
                          weather.location
                        }
                        weather={weather}
                      />

                    )
                  )}

                </div>

              )}



            {!weatherLoading &&
              !weatherError &&
              routeWeather.length === 0 && (

                <div className="py-6 text-center">

                  <p className="text-sm text-slate-500">
                    No route weather data available.
                  </p>

                </div>

              )}



            <div className="mt-3 flex items-center gap-2">

              <MapPin
                size={13}
                className="text-slate-400 shrink-0"
              />

              <p className="text-[9px] text-slate-400">

                Weather is fetched from Open-Meteo and
                cached by the backend to avoid unnecessary
                repeated requests.

              </p>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
};



export default LiveStatus;