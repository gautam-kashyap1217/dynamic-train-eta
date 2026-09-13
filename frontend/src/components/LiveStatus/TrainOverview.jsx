
import React from "react";
import { TrainFront } from "lucide-react";

const formatMinutes = (value) => {
  if (value === null || value === undefined || value === "") {
    return "--";
  }

  const minutes = Number(value);

  if (Number.isNaN(minutes)) {
    return "--";
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);

  if (hours > 0) {
    return `${hours} hr ${remainingMinutes} min`;
  }

  return `${remainingMinutes} min`;
};

const formatClockTime = (value) => {
  if (!value) {
    return "--";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
};

const TrainOverview = ({ train = {}, live = {}, prediction = null }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <TrainFront size={22} className="text-blue-600" />
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-900">
            Train Overview
          </h2>

          <p className="text-[11px] text-slate-400 mt-0.5">
            ML-based journey prediction
          </p>
        </div>
      </div>

      {/* Train Details */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-slate-500">Train</span>

          <span className="text-xs font-semibold text-slate-900 text-right">
            {train.name || "--"}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-slate-500">Train Number</span>

          <span className="text-xs font-semibold text-slate-900">
            {train.number || "--"}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-slate-500">Current Location</span>

          <span className="text-xs font-semibold text-slate-900 text-right">
            {live.currentLocation || "--"}
          </span>
        </div>

        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-slate-500">Next Station</span>

          <span className="text-xs font-semibold text-blue-700 text-right">
            {live.nextStation || prediction?.nextStation || "--"}
          </span>
        </div>
      </div>

      {/* ML Prediction */}
      <div className="mt-5 pt-4 border-t border-slate-200">
        <h3 className="text-xs font-bold text-slate-700 mb-3">
          Next Station Prediction
        </h3>

        {!prediction ? (
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <p className="text-xs text-slate-500">
              ETA prediction is currently unavailable.
            </p>

            <p className="text-[10px] text-slate-400 mt-1">
              Waiting for ETA model response.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Main ETA Card */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-[11px] text-blue-600 font-medium">
                Estimated Time to Next Station
              </p>

              <p className="text-2xl font-bold text-blue-700 mt-1">
                {formatMinutes(prediction.etaMinutes)}
              </p>

              <p className="text-[11px] text-blue-600 mt-2">
                Predicted arrival time:{" "}
                <span className="font-bold">
                  {formatClockTime(prediction.predictedArrival)}
                </span>
              </p>
            </div>

            {/* Prediction Range */}
            <div>
              <p className="text-[11px] font-semibold text-slate-600 mb-2">
                Estimated prediction range
              </p>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-[10px] text-green-600 font-semibold">
                    Earliest
                  </p>

                  <p className="text-sm font-bold text-green-700 mt-1">
                    {formatMinutes(prediction.p10)}
                  </p>

                  <p className="text-[9px] text-green-600 mt-1">
                    Favorable conditions
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <p className="text-[10px] text-blue-600 font-semibold">
                    Expected
                  </p>

                  <p className="text-sm font-bold text-blue-700 mt-1">
                    {formatMinutes(prediction.p50)}
                  </p>

                  <p className="text-[9px] text-blue-600 mt-1">
                    Most likely
                  </p>
                </div>

                <div className="bg-orange-50 rounded-lg p-3 text-center">
                  <p className="text-[10px] text-orange-600 font-semibold">
                    Latest
                  </p>

                  <p className="text-sm font-bold text-orange-700 mt-1">
                    {formatMinutes(prediction.p90)}
                  </p>

                  <p className="text-[9px] text-orange-600 mt-1">
                    Unfavorable conditions
                  </p>
                </div>
              </div>
            </div>

            {/* Delay Variation */}
            <div className="bg-slate-50 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-500">
                  Possible time saved
                </span>

                <span className="text-[11px] font-bold text-green-600">
                  {formatMinutes(prediction.canArriveEarlierBy)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-500">
                  Possible additional delay
                </span>

                <span className="text-[11px] font-bold text-orange-600">
                  {formatMinutes(prediction.canBeDelayedBy)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainOverview;