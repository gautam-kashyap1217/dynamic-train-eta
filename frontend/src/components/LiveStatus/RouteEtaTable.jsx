import React from "react";
import { MapPin, Info } from "lucide-react";

const formatTime = (value) => {
  if (!value) return "--";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
};

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

const formatDifference = (value) => {
  if (
    value === null ||
    value === undefined ||
    Number.isNaN(Number(value))
  ) {
    return "";
  }

  const difference = Math.round(Number(value));

  if (difference === 0) {
    return "On time";
  }

  return `${difference > 0 ? "+" : "−"}${Math.abs(difference)} min`;
};

const getTimeDifference = (firstTime, secondTime) => {
  if (!firstTime || !secondTime) {
    return null;
  }

  const first = new Date(firstTime);
  const second = new Date(secondTime);

  if (
    Number.isNaN(first.getTime()) ||
    Number.isNaN(second.getTime())
  ) {
    return null;
  }

  return (first.getTime() - second.getTime()) / 60000;
};

const getStationName = (station) =>
  station.name ||
  station.stationName ||
  station.station?.name ||
  station.station?.stationName ||
  station.code ||
  station.stationCode ||
  "Unknown Station";

const getStationCode = (station) =>
  station.code ||
  station.stationCode ||
  station.station?.code ||
  station.station?.stationCode ||
  "";

const getArrivalActual = (station) =>
  station.arrival?.actual ||
  station.actualArrival ||
  station.arrivalTime ||
  null;

const getDepartureActual = (station) =>
  station.departure?.actual ||
  station.actualDeparture ||
  station.departureTime ||
  null;

const getArrivalPredicted = (station) =>
  station.arrival?.predicted ||
  station.predictedArrival ||
  station.scheduledArrival ||
  null;

const getDeparturePredicted = (station) =>
  station.departure?.predicted ||
  station.predictedDeparture ||
  station.scheduledDeparture ||
  null;

const formatConfidence = (confidence) => {
  if (
    confidence === null ||
    confidence === undefined ||
    confidence === "" ||
    confidence === "--"
  ) {
    return "--";
  }

  const numericConfidence = Number(confidence);

  if (Number.isNaN(numericConfidence)) {
    return confidence;
  }

  return `${Math.round(numericConfidence)}%`;
};

const getPredictionValue = (prediction, snakeCaseKey, camelCaseKey) =>
  prediction?.[snakeCaseKey] ?? prediction?.[camelCaseKey];

const RouteEtaTable = ({ stations = [], prediction = null }) => {
  const etaMinutes = getPredictionValue(
    prediction,
    "eta_minutes",
    "etaMinutes"
  );

  const p10 = getPredictionValue(prediction, "p10", "p10");
  const p50 = getPredictionValue(prediction, "p50", "p50");
  const p90 = getPredictionValue(prediction, "p90", "p90");

  const earlierBy = getPredictionValue(
    prediction,
    "can_arrive_earlier_by",
    "canArriveEarlierBy"
  );

  const delayedBy = getPredictionValue(
    prediction,
    "can_be_delayed_by",
    "canBeDelayedBy"
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">
            <MapPin size={20} className="text-blue-600" />
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900">
              Route & Station-wise ETA
            </h2>

            <p className="text-[10px] text-slate-400 mt-0.5">
              Predicted arrival and departure times
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />

            <span className="text-[10px] text-slate-500">
              Selected Route
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />

            <span className="text-[10px] text-slate-500">
              Other Stations
            </span>
          </div>
        </div>
      </div>

      {/* Overall ML ETA Summary */}
      {prediction && (
        <div className="mx-4 mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="text-xs font-semibold text-blue-700">
                ML-Based ETA Prediction
              </p>

              <p className="text-2xl font-bold text-blue-900 mt-1">
                {formatMinutes(etaMinutes)}
              </p>

              <p className="text-[11px] text-blue-700 mt-1">
                Estimated travel time to the next station
              </p>
            </div>

            <div className="text-right">
              <p className="text-[10px] text-blue-600">
                Prediction Range
              </p>

              <p className="text-sm font-bold text-blue-900 mt-1">
                {formatMinutes(p10)} – {formatMinutes(p90)}
              </p>

              <p className="text-[9px] text-blue-600 mt-1">
                Earliest to latest estimated arrival
              </p>
            </div>
          </div>

          {/* Prediction Cards */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            {/* Earliest */}
            <div className="rounded-lg bg-green-50 border border-green-100 p-3 text-center">
              <p className="text-[10px] text-green-600 font-semibold">
                Earliest
              </p>

              <p className="text-sm font-bold text-green-700 mt-1">
                {formatMinutes(p10)}
              </p>

              <p className="text-[10px] font-bold text-green-600 mt-1">
                {p10 !== null && p10 !== undefined && p50 !== null
                  ? formatDifference(Number(p10) - Number(p50))
                  : "--"}
              </p>
            </div>

            {/* Expected */}
            <div className="rounded-lg bg-white border border-blue-100 p-3 text-center">
              <p className="text-[10px] text-blue-600 font-semibold">
                Expected
              </p>

              <p className="text-sm font-bold text-blue-700 mt-1">
                {formatMinutes(p50 ?? etaMinutes)}
              </p>

              <p className="text-[10px] font-bold text-blue-600 mt-1">
                Expected time
              </p>
            </div>

            {/* Latest */}
            <div className="rounded-lg bg-orange-50 border border-orange-100 p-3 text-center">
              <p className="text-[10px] text-orange-600 font-semibold">
                Latest
              </p>

              <p className="text-sm font-bold text-orange-700 mt-1">
                {formatMinutes(p90)}
              </p>

              <p className="text-[10px] font-bold text-orange-600 mt-1">
                {p90 !== null && p90 !== undefined && p50 !== null
                  ? formatDifference(Number(p90) - Number(p50))
                  : "--"}
              </p>
            </div>
          </div>

          {/* Early and Delay Margins */}
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="rounded-lg bg-white/70 p-3">
              <p className="text-[10px] text-slate-500">
                Can arrive earlier by
              </p>

              <p className="text-sm font-bold text-green-700 mt-1">
                {formatMinutes(earlierBy)}
              </p>
            </div>

            <div className="rounded-lg bg-white/70 p-3">
              <p className="text-[10px] text-slate-500">
                Can be delayed by
              </p>

              <p className="text-sm font-bold text-orange-600 mt-1">
                {formatMinutes(delayedBy)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="p-3">
        <div className="border border-slate-200 rounded-xl overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[1.3fr_1fr_1fr_0.55fr] bg-slate-50 border-b border-slate-200">
            <div className="px-4 py-3 text-[11px] font-bold text-slate-700">
              Station
            </div>

            <div className="px-4 py-3 border-l border-slate-200">
              <p className="text-[11px] font-bold text-slate-700">
                Arrival
              </p>

              <p className="text-[9px] text-slate-400 mt-1">
                Actual | Predicted
              </p>
            </div>

            <div className="px-4 py-3 border-l border-slate-200">
              <p className="text-[11px] font-bold text-slate-700">
                Departure
              </p>

              <p className="text-[9px] text-slate-400 mt-1">
                Actual | Predicted
              </p>
            </div>

            <div className="px-4 py-3 border-l border-slate-200 text-center">
              <p className="text-[11px] font-bold text-slate-700">
                Confidence
              </p>
            </div>
          </div>

          {/* Station Rows */}
          {stations.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Route information is unavailable.
            </div>
          ) : (
            stations.map((station, index) => {
              const stationName = getStationName(station);
              const stationCode = getStationCode(station);

              const isCurrent =
                station.status === "current" ||
                station.status === "at-station" ||
                station.isCurrent === true;

              const isCompleted =
                station.status === "completed" ||
                station.reached === true ||
                Boolean(station.actualArrival) ||
                Boolean(station.actualDeparture);

              const isLast = index === stations.length - 1;

              const arrivalActual = getArrivalActual(station);
              const departureActual = getDepartureActual(station);

              const arrivalPredicted = getArrivalPredicted(station);
              const departurePredicted = getDeparturePredicted(station);

              const confidence =
                station.confidence ??
                station.predictionConfidence ??
                "--";

              const formattedConfidence = formatConfidence(confidence);

              /*
                This compares the predicted departure time with the
                available reference departure time.

                Positive value  = later departure
                Negative value  = earlier departure
                Zero             = on time
              */
              const departureDifference = getTimeDifference(
                departurePredicted,
                departureActual
              );

              return (
                <div
                  key={`${stationCode || stationName}-${index}`}
                  className={`grid grid-cols-[1.3fr_1fr_1fr_0.55fr] border-b border-slate-100 last:border-b-0 ${
                    isCurrent ? "bg-blue-50/70" : "bg-white"
                  }`}
                >
                  {/* Station */}
                  <div className="px-4 py-5 relative">
                    {!isLast && (
                      <div className="absolute left-[29px] top-[52px] bottom-[-1px] w-[3px] bg-blue-300" />
                    )}

                    <div className="flex items-start gap-3">
                      <div
                        className={`relative z-10 h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${
                          isCurrent
                            ? "bg-blue-600 ring-4 ring-blue-100"
                            : isCompleted
                            ? "bg-blue-600"
                            : "bg-blue-400"
                        }`}
                      >
                        <span className="h-2 w-2 bg-white rounded-full" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-slate-900">
                            {stationName}
                          </p>

                          {stationCode && (
                            <span className="text-[10px] text-slate-400">
                              {stationCode}
                            </span>
                          )}

                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[9px] font-semibold">
                              LIVE
                            </span>
                          )}
                        </div>

                        {station.distance !== undefined && (
                          <p className="text-[11px] text-blue-500 mt-1">
                            {station.distance} km
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Arrival */}
                  <div className="px-4 py-5 border-l border-slate-200">
                    <p className="text-sm font-bold text-slate-800">
                      {formatTime(arrivalActual)}
                    </p>

                    <p className="text-[10px] text-blue-600 mt-1">
                      {formatTime(arrivalPredicted)}
                    </p>
                  </div>

                  {/* Departure */}
                  <div className="px-4 py-5 border-l border-slate-200">
                    <p className="text-sm font-bold text-slate-800">
                      {formatTime(departureActual)}
                    </p>

                    <div className="flex items-center gap-1 flex-wrap mt-1">
                      <p className="text-[10px] text-blue-600">
                        {formatTime(departurePredicted)}
                      </p>

                      {departureDifference !== null && (
                        <span
                          className={`text-[10px] font-bold ${
                            departureDifference > 0
                              ? "text-orange-600"
                              : departureDifference < 0
                              ? "text-green-600"
                              : "text-slate-500"
                          }`}
                        >
                          {formatDifference(departureDifference)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Confidence */}
                  <div className="px-3 py-5 border-l border-slate-200 flex items-start justify-center">
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold whitespace-nowrap">
                      • {formattedConfidence}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Information Note */}
        <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-3">
          <Info size={18} className="text-blue-600 mt-0.5 shrink-0" />

          <p className="text-[11px] text-blue-700 leading-relaxed">
            Actual station timings are taken from available live railway
            route data. ML-based predictions represent the estimated travel
            time for the current route segment. Positive departure values
            indicate a later time, while negative values indicate an earlier
            time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RouteEtaTable;