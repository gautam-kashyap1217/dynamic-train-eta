
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

  // Selected train from TrainResults page
  const selectedTrain = location.state?.train;

  const trainNumber =
    typeof selectedTrain === "string"
      ? selectedTrain
      : selectedTrain?.number || "12951";

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadLiveStatus = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await getLiveTrainStatus(trainNumber);

        // Preserve selected train details and route information
        const updatedData = {
          ...result,

          train: {
            ...result.train,

            ...(typeof selectedTrain === "object"
              ? selectedTrain
              : {}),

            from:
              selectedTrain?.from ||
              location.state?.from ||
              result.train?.from,

            to:
              selectedTrain?.to ||
              location.state?.to ||
              result.train?.to,
          },
        };

        setData(updatedData);
      } catch (err) {
        console.error("Live status error:", err);
        setError("Unable to load live train status.");
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
            Loading live train status...
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
            {error || "No data available"}
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