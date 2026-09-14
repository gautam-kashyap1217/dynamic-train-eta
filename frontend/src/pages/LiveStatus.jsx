import React, { useEffect, useState } from "react";

import { useLocation, useNavigate } from "react-router";

import LiveTrainHeader from "../components/LiveStatus/LiveTrainHeader";
import LiveStats from "../components/LiveStatus/LiveStats";
import RouteEtaTable from "../components/LiveStatus/RouteEtaTable";
import LiveRouteMap from "../components/LiveStatus/LiveRouteMap";
import DelayReason from "../components/LiveStatus/DelayReason";
import TrainOverview from "../components/LiveStatus/TrainOverview";
import QuickActions from "../components/LiveStatus/QuickActions";

import { getLiveTrainStatus } from "../services/liveStatusApi";


const LiveStatus = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Selected train from the TrainResults page
  const selectedTrain = location.state?.train;

  const trainNumber =
    typeof selectedTrain === "string"
      ? selectedTrain
      : selectedTrain?.number ||
        selectedTrain?.train_number ||
        "12951";

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadLiveStatus = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await getLiveTrainStatus(trainNumber);

        if (!result) {
          throw new Error("No train data was returned by the server.");
        }

        /*
         * Keep the complete response structure expected by
         * the existing dashboard components.
         */
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

          stations: Array.isArray(result.stations)
            ? result.stations
            : [],

          prediction: result.prediction || null,

          delayReason:
            result.delayReason || null,

          weather:
            result.weather || null,
        };

        setData(updatedData);
      } catch (err) {
        console.error("Live status error:", err);

        setError(
          err.message || "Unable to load live train status."
        );
      } finally {
        setLoading(false);
      }
    };

    loadLiveStatus();
  }, [trainNumber]);

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

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
          <p className="text-red-500 font-semibold">
            {error || "No train data available"}
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
        {/* Train Header */}
        <LiveTrainHeader train={data.train} />

        {/* Live Statistics */}
        <LiveStats
          live={data.live}
          prediction={data.prediction}
        />

        {/* Main Content */}
        <div className="grid grid-cols-[1.4fr_1fr] gap-4 mt-4">
          {/* LEFT SECTION */}
          <RouteEtaTable
            stations={data.stations}
            prediction={data.prediction}
          />

          {/* RIGHT SECTION */}
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
      </main>
    </div>
  );
};

export default LiveStatus;