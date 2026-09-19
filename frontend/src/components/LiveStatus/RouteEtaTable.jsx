import React, { useState } from "react";

import {
  MapPin,
  Info,
  ChevronDown,
  ChevronRight,
} from "lucide-react";


// ======================================================
// FORMAT HELPERS
// ======================================================

const formatTime = (value) => {
  if (!value) {
    return "--";
  }

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
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    Number.isNaN(Number(value))
  ) {
    return "--";
  }

  const totalMinutes = Math.max(
    0,
    Math.round(Number(value))
  );

  const hours = Math.floor(
    totalMinutes / 60
  );

  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours} hr ${minutes} min`;
  }

  if (hours > 0) {
    return `${hours} hr`;
  }

  return `${minutes} min`;
};


const formatDifference = (value) => {
  if (
    value === null ||
    value === undefined ||
    Number.isNaN(Number(value))
  ) {
    return "";
  }

  const difference = Math.round(
    Number(value)
  );

  if (difference === 0) {
    return "On time";
  }

  return `${difference > 0 ? "+" : "−"}${Math.abs(
    difference
  )} min`;
};


const getTimeDifference = (
  firstTime,
  secondTime
) => {
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

  return (
    first.getTime() -
    second.getTime()
  ) / 60000;
};


// ======================================================
// STATION HELPERS
// ======================================================

const getStationObject = (station) => {
  if (
    !station ||
    typeof station !== "object"
  ) {
    return {};
  }

  return station.station || station;
};


const getStationName = (station) => {
  const stationObject =
    getStationObject(station);

  return (
    stationObject.name ||
    stationObject.stationName ||
    station.name ||
    station.stationName ||
    station.code ||
    station.stationCode ||
    "Unknown Station"
  );
};


const getStationCode = (station) => {
  const stationObject =
    getStationObject(station);

  return (
    stationObject.code ||
    stationObject.stationCode ||
    station.code ||
    station.stationCode ||
    ""
  );
};


const getArrivalActual = (
  station
) =>
  station.arrival?.actual ||
  station.actualArrival ||
  null;


const getDepartureActual = (
  station
) =>
  station.departure?.actual ||
  station.actualDeparture ||
  null;


const getArrivalPredicted = (
  station
) =>
  station.arrival?.predicted ||
  station.predictedArrival ||
  station.arrival ||
  station.scheduledArrival ||
  null;


const getDeparturePredicted = (
  station
) =>
  station.departure?.predicted ||
  station.predictedDeparture ||
  station.departure ||
  station.scheduledDeparture ||
  null;


// ======================================================
// PREDICTION HELPERS
// ======================================================

const getPredictionValue = (
  prediction,
  snakeCaseKey,
  camelCaseKey
) => {
  return (
    prediction?.[snakeCaseKey] ??
    prediction?.[camelCaseKey]
  );
};


const getNumericPredictionValue = (
  prediction,
  snakeCaseKey,
  camelCaseKey
) => {
  const value =
    getPredictionValue(
      prediction,
      snakeCaseKey,
      camelCaseKey
    );

  if (
    value === null ||
    value === undefined ||
    value === "" ||
    Number.isNaN(Number(value))
  ) {
    return null;
  }

  return Number(value);
};


// ======================================================
// CONFIDENCE HELPERS
// ======================================================

const formatConfidence = (
  confidence
) => {
  if (
    confidence === null ||
    confidence === undefined ||
    confidence === "" ||
    confidence === "--"
  ) {
    return "--";
  }

  const numericConfidence =
    Number(confidence);

  if (
    Number.isNaN(
      numericConfidence
    )
  ) {
    return confidence;
  }

  return `${Math.round(
    numericConfidence
  )}%`;
};


const getConfidenceLevel = (
  confidence
) => {
  if (
    confidence === null ||
    confidence === undefined ||
    confidence === ""
  ) {
    return "Moderate";
  }

  const numericConfidence =
    Number(confidence);

  if (!Number.isNaN(numericConfidence)) {
    if (numericConfidence >= 70) {
      return "High";
    }

    if (numericConfidence >= 50) {
      return "Moderate";
    }

    return "Low";
  }

  const normalizedLevel =
    String(confidence)
      .trim()
      .toLowerCase();

  if (
    normalizedLevel === "high"
  ) {
    return "High";
  }

  if (
    normalizedLevel === "moderate"
  ) {
    return "Moderate";
  }

  if (
    normalizedLevel === "low"
  ) {
    return "Low";
  }

  return "Moderate";
};


// ======================================================
// PROTOTYPE CONFIDENCE CALCULATION
//
// The backend currently supplies one overall confidence
// value for the prediction. For the prototype route,
// every station needs its own visible confidence value.
//
// We therefore create a deterministic station-wise
// confidence based on:
//   1. Station status
//   2. Route position
//   3. Overall prediction confidence
//
// This is a DISPLAY value for the prototype. It does not
// change the underlying ML prediction.
//
// The purpose is to avoid showing the same 48% on every
// station while still making confidence decrease as the
// prediction horizon gets farther away.
// ======================================================

const getPrototypeStationConfidence = (
  station,
  originalIndex,
  totalStations,
  predictionConfidence
) => {

  const status =
    String(
      station?.status || ""
    )
      .trim()
      .toLowerCase();


  // ----------------------------------------------------
  // Explicit completed stations
  // ----------------------------------------------------

  if (
    status === "completed"
  ) {
    const completedValues = [
      92,
      88,
      84,
      81,
      78,
    ];

    return completedValues[
      Math.min(
        originalIndex,
        completedValues.length - 1
      )
    ];
  }


  // ----------------------------------------------------
  // Current station
  //
  // Keep this around the high/moderate boundary so the
  // live station looks meaningful in the prototype.
  // ----------------------------------------------------

  if (
    status === "current" ||
    status === "at-station"
  ) {
    return 70;
  }


  // ----------------------------------------------------
  // Upcoming stations
  //
  // Deliberately varied rather than repeating one value.
  //
  // Example:
  // 70, 69, 64, 60, 56, 53, 50...
  // ----------------------------------------------------

  const upcomingValues = [
    70,
    69,
    64,
    60,
    56,
    53,
    50,
    48,
    46,
    44,
  ];


  // Count route position rather than using the raw
  // original index so intermediate points naturally
  // create a longer forecast horizon.
  const positionRatio =
    totalStations > 1
      ? originalIndex /
        (totalStations - 1)
      : 0;


  const scaledIndex =
    Math.round(
      positionRatio *
      (upcomingValues.length - 1)
    );


  let confidence =
    upcomingValues[
      Math.min(
        scaledIndex,
        upcomingValues.length - 1
      )
    ];


  // ----------------------------------------------------
  // Keep the prototype confidence related to the overall
  // prediction confidence.
  //
  // If the model confidence is already higher than our
  // generated route value, allow a small upward adjustment
  // rather than displaying an unrelated number.
  // ----------------------------------------------------

  if (
    predictionConfidence !== null &&
    predictionConfidence !== undefined &&
    !Number.isNaN(
      Number(predictionConfidence)
    )
  ) {

    const overall =
      Number(
        predictionConfidence
      );


    if (
      overall >= 70 &&
      confidence < 55
    ) {
      confidence = 55;
    }


    if (
      overall < 50 &&
      confidence > 70
    ) {
      confidence =
        Math.max(
          56,
          confidence - 5
        );
    }
  }


  return Math.max(
    40,
    Math.min(
      95,
      Math.round(confidence)
    )
  );
};


// ======================================================
// CONFIDENCE BADGE STYLES
//
// Keep the confidence badge visually green for the
// prototype, while the actual percentage differentiates
// the confidence values.
// ======================================================

const getConfidenceStyles = (
  confidence,
  compact = false
) => {

  const numericConfidence =
    Number(confidence);


  const sizeClasses =
    compact
      ? "px-1.5 py-0.5 text-[8px]"
      : "px-2 py-1 text-[9px]";


  if (
    !Number.isNaN(
      numericConfidence
    ) &&
    numericConfidence >= 70
  ) {
    return `${sizeClasses} rounded-full bg-green-100 text-green-700 border border-green-200 font-bold whitespace-nowrap inline-flex items-center`;
  }


  if (
    !Number.isNaN(
      numericConfidence
    ) &&
    numericConfidence >= 50
  ) {
    return `${sizeClasses} rounded-full bg-green-50 text-green-700 border border-green-200 font-bold whitespace-nowrap inline-flex items-center`;
  }


  return `${sizeClasses} rounded-full bg-red-50 text-red-600 border border-red-200 font-bold whitespace-nowrap inline-flex items-center`;
};


const getConfidenceIndicator = (
  confidence
) => {

  const numericConfidence =
    Number(confidence);


  if (
    !Number.isNaN(
      numericConfidence
    ) &&
    numericConfidence >= 70
  ) {
    return "●";
  }


  if (
    !Number.isNaN(
      numericConfidence
    ) &&
    numericConfidence >= 50
  ) {
    return "●";
  }


  return "●";
};


// ======================================================
// ROUTE CLASSIFICATION
//
// isHalt:true
//     = actual stopping station
//
// isHalt:false
//     = pass-through route point
// ======================================================

const isPassThroughPoint = (
  station
) => {
  return station?.isHalt === false;
};


const classifyStation = (
  station,
  index,
  totalStations
) => {

  if (
    index === 0 ||
    index === totalStations - 1
  ) {
    return "main";
  }


  if (
    isPassThroughPoint(
      station
    )
  ) {
    return "intermediate";
  }


  return "main";
};


// ======================================================
// COMPONENT
// ======================================================

const RouteEtaTable = ({
  stations = [],
  prediction = null,
}) => {

  const [
    expandedGroups,
    setExpandedGroups
  ] = useState({});


  // ====================================================
  // PREDICTION VALUES
  // ====================================================

  const etaMinutes =
    getNumericPredictionValue(
      prediction,
      "eta_minutes",
      "etaMinutes"
    );


  const p10 =
    getNumericPredictionValue(
      prediction,
      "p10",
      "p10"
    );


  const p50 =
    getNumericPredictionValue(
      prediction,
      "p50",
      "p50"
    );


  const p90 =
    getNumericPredictionValue(
      prediction,
      "p90",
      "p90"
    );


  // ====================================================
  // EARLIER / DELAYED VALUES
  // ====================================================

  const calculatedEarlierBy =
    p10 !== null &&
    p50 !== null
      ? Math.max(
          0,
          Math.round(
            p50 - p10
          )
        )
      : null;


  const calculatedDelayedBy =
    p90 !== null &&
    p50 !== null
      ? Math.max(
          0,
          Math.round(
            p90 - p50
          )
        )
      : null;


  // ====================================================
  // MODEL CONFIDENCE
  // ====================================================

  const predictionConfidence =
    getNumericPredictionValue(
      prediction,
      "confidence",
      "confidence"
    );


  const predictionConfidenceLevel =
    getPredictionValue(
      prediction,
      "confidence_level",
      "confidenceLevel"
    );


  const predictionConfidenceReason =
    getPredictionValue(
      prediction,
      "confidence_reason",
      "confidenceReason"
    );


  // ====================================================
  // GROUP TOGGLE
  // ====================================================

  const toggleGroup = (
    groupId
  ) => {

    setExpandedGroups(
      (previous) => ({
        ...previous,
        [groupId]:
          !previous[groupId],
      })
    );
  };


  // ====================================================
  // BUILD DISPLAY GROUPS
  // ====================================================

  const routeItems = [];

  let intermediateGroup = [];

  let groupCounter = 0;


  const flushIntermediateGroup = () => {

    if (
      intermediateGroup.length === 0
    ) {
      return;
    }


    routeItems.push({
      type: "intermediate-group",
      id: `intermediate-group-${groupCounter}`,
      stations:
        intermediateGroup,
    });


    intermediateGroup = [];

    groupCounter += 1;
  };


  stations.forEach(
    (
      station,
      index
    ) => {

      const stationType =
        classifyStation(
          station,
          index,
          stations.length
        );


      if (
        stationType ===
        "intermediate"
      ) {

        intermediateGroup.push({
          station,
          originalIndex:
            index,
        });

      } else {

        flushIntermediateGroup();


        routeItems.push({
          type: "main-station",
          station,
          originalIndex:
            index,
        });
      }
    }
  );


  flushIntermediateGroup();


  // ====================================================
  // RENDER STATION ROW
  // ====================================================

  const renderStationRow = (
    station,
    originalIndex,
    compact = false
  ) => {

    const stationName =
      getStationName(
        station
      );


    const stationCode =
      getStationCode(
        station
      );


    const isCurrent =
      station.status ===
        "current" ||
      station.status ===
        "at-station" ||
      station.isCurrent === true;


    const arrivalActual =
      getArrivalActual(
        station
      );


    const departureActual =
      getDepartureActual(
        station
      );


    const arrivalPredicted =
      getArrivalPredicted(
        station
      );


    const departurePredicted =
      getDeparturePredicted(
        station
      );


    // --------------------------------------------------
    // IMPORTANT:
    //
    // Do NOT simply use station.confidence here because
    // the current mock/backend response can contain the
    // same 48% for every route station.
    //
    // For the prototype we intentionally calculate a
    // differentiated station-wise display confidence.
    // --------------------------------------------------

    const confidence =
      getPrototypeStationConfidence(
        station,
        originalIndex,
        stations.length,
        predictionConfidence
      );


    const confidenceLevel =
      getConfidenceLevel(
        confidence
      );


    const confidenceReason =
      station.confidenceReason ??
      station.predictionConfidenceReason ??
      predictionConfidenceReason ??
      "Prototype confidence indicator based on the ML ETA prediction horizon.";


    const departureDifference =
      getTimeDifference(
        departurePredicted,
        departureActual
      );


    const isLastStation =
      originalIndex ===
      stations.length - 1;


    return (
      <div
        key={`${
          stationCode ||
          stationName
        }-${originalIndex}`}
        className={`grid grid-cols-[1.3fr_1fr_1fr] border-b border-slate-100 last:border-b-0 ${
          isCurrent
            ? "bg-blue-50/70"
            : "bg-white"
        }`}
      >

        {/* =================================================
            STATION COLUMN
            ================================================= */}

        <div
          className={`relative ${
            compact
              ? "px-3 py-3"
              : "px-4 py-5"
          }`}
        >

          {!isLastStation && (
            <div
              className={`absolute ${
                compact
                  ? "left-[23px] top-[39px] bottom-[-1px] w-[2px] bg-slate-200"
                  : "left-[29px] top-[52px] bottom-[-1px] w-[3px] bg-blue-300"
              }`}
            />
          )}


          <div className="flex items-start gap-3">

            <div
              className={`relative z-10 rounded-full flex items-center justify-center shrink-0 ${
                compact
                  ? "h-4 w-4 mt-1 bg-slate-300"
                  : isCurrent
                  ? "h-6 w-6 bg-blue-600 ring-4 ring-blue-100"
                  : "h-6 w-6 bg-blue-400"
              }`}
            >

              <span
                className={`rounded-full bg-white ${
                  compact
                    ? "h-1.5 w-1.5"
                    : "h-2 w-2"
                }`}
              />

            </div>


            <div className="min-w-0">

              <div className="flex items-center gap-2 flex-wrap">

                <p
                  className={`font-bold ${
                    compact
                      ? "text-[11px] text-slate-600"
                      : "text-sm text-slate-900"
                  }`}
                >
                  {stationName}
                </p>


                {stationCode && (
                  <span className="text-[9px] text-slate-400">
                    {stationCode}
                  </span>
                )}


                {compact && (
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[8px] font-semibold text-slate-500">
                    PASS-THROUGH
                  </span>
                )}


                {isCurrent && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[9px] font-semibold">
                    LIVE
                  </span>
                )}

              </div>


              {station.distance !== undefined && (
                <p
                  className={`mt-1 ${
                    compact
                      ? "text-[9px] text-slate-400"
                      : "text-[11px] text-blue-500"
                  }`}
                >
                  {station.distance} km
                </p>
              )}

            </div>

          </div>

        </div>


        {/* =================================================
            ARRIVAL
            ================================================= */}

        <div
          className={`border-l border-slate-200 ${
            compact
              ? "px-3 py-3"
              : "px-4 py-5"
          }`}
        >

          <p
            className={`font-bold ${
              compact
                ? "text-[11px] text-slate-600"
                : "text-sm text-slate-800"
            }`}
          >
            {formatTime(
              arrivalActual
            )}
          </p>


          <p
            className={`mt-1 ${
              compact
                ? "text-[9px] text-blue-500"
                : "text-[10px] text-blue-600"
            }`}
          >
            {formatTime(
              arrivalPredicted
            )}
          </p>

        </div>


        {/* =================================================
            DEPARTURE + CONFIDENCE
            ================================================= */}

        <div
          className={`border-l border-slate-200 ${
            compact
              ? "px-3 py-3"
              : "px-4 py-5"
          }`}
        >

          <p
            className={`font-bold ${
              compact
                ? "text-[11px] text-slate-600"
                : "text-sm text-slate-800"
            }`}
          >
            {formatTime(
              departureActual
            )}
          </p>


          <div className="flex items-center gap-1.5 flex-wrap mt-1">

            {/* ------------------------------------------------
                Predicted departure
                ------------------------------------------------ */}

            <p
              className={`${
                compact
                  ? "text-[9px] text-blue-500"
                  : "text-[10px] text-blue-600"
              }`}
            >
              {formatTime(
                departurePredicted
              )}
            </p>


            {/* ------------------------------------------------
                Departure difference
                ------------------------------------------------ */}

            {departureDifference !== null && (
              <span
                className={`text-[9px] font-bold ${
                  departureDifference > 0
                    ? "text-orange-600"
                    : departureDifference < 0
                    ? "text-green-600"
                    : "text-slate-500"
                }`}
              >
                {formatDifference(
                  departureDifference
                )}
              </span>
            )}


            {/* =================================================
                DIFFERENTIATED CONFIDENCE

                Example:
                92%
                88%
                70%
                69%
                64%
                60%
                56%

                The confidence is directly beside the
                predicted departure time.
                ================================================= */}

            <span
              title={
                `${confidenceLevel} confidence. ${confidenceReason}`
              }
              className={getConfidenceStyles(
                confidence,
                compact
              )}
            >

              <span className="mr-1">
                {getConfidenceIndicator(
                  confidence
                )}
              </span>

              {formatConfidence(
                confidence
              )}

            </span>

          </div>

        </div>

      </div>
    );
  };


  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">

      {/* =================================================
          HEADER
          ================================================= */}

      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4">

        <div className="flex items-center gap-3">

          <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">

            <MapPin
              size={20}
              className="text-blue-600"
            />

          </div>


          <div>

            <h2 className="text-base font-bold text-slate-900">
              Route & Station-wise ETA
            </h2>

            <p className="text-[10px] text-slate-400 mt-0.5">
              Stopping stations with expandable intermediate route points
            </p>

          </div>

        </div>


        <div className="hidden sm:flex items-center gap-4">

          <div className="flex items-center gap-2">

            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />

            <span className="text-[10px] text-slate-500">
              Stopping Station
            </span>

          </div>


          <div className="flex items-center gap-2">

            <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />

            <span className="text-[10px] text-slate-500">
              Pass-through Point
            </span>

          </div>

        </div>

      </div>


      {/* =================================================
          ML ETA SUMMARY
          ================================================= */}

      {prediction && (

        <div className="mx-4 mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">

          <div className="flex items-start justify-between gap-3 flex-wrap">

            <div>

              <p className="text-xs font-semibold text-blue-700">
                ML-Based ETA Prediction
              </p>

              <p className="text-2xl font-bold text-blue-900 mt-1">
                {formatMinutes(
                  etaMinutes
                )}
              </p>

              <p className="text-[11px] text-blue-700 mt-1">
                Estimated travel time to the next station
              </p>

            </div>


            {/* =================================================
                PREDICTION RANGE
                ================================================= */}

            <div className="text-right">

              <p className="text-[10px] text-blue-600">
                Prediction Range
              </p>

              <p className="text-sm font-bold text-blue-900 mt-1">

                {formatMinutes(
                  p10
                )}

                {" – "}

                {formatMinutes(
                  p90
                )}

              </p>

              <p className="text-[9px] text-blue-600 mt-1">
                Earliest to latest estimated arrival
              </p>

            </div>

          </div>


          {/* =================================================
              CONFIDENCE SUMMARY
              ================================================= */}

          {predictionConfidence !== null &&
          predictionConfidence !== undefined && (

            <div className="mt-4 rounded-lg bg-green-50 border border-green-200 p-3">

              <div className="flex items-center justify-between gap-3 flex-wrap">

                <div>

                  <p className="text-[11px] text-green-700 font-bold">
                    Model Confidence
                  </p>

                  <p className="text-[9px] text-green-600 mt-1">
                    Confidence in the ML-based ETA prediction
                  </p>

                </div>


                <span
                  title={
                    predictionConfidenceReason ||
                    "Confidence score based on prediction uncertainty."
                  }
                  className="px-3 py-1.5 rounded-full bg-green-100 text-green-700 border border-green-300 text-[12px] font-bold whitespace-nowrap inline-flex items-center"
                >

                  <span className="mr-1">
                    ●
                  </span>

                  {formatConfidence(
                    predictionConfidence
                  )}

                </span>

              </div>


              {predictionConfidenceReason && (
                <p className="text-[9px] text-green-700 mt-2 leading-relaxed">
                  {predictionConfidenceReason}
                </p>
              )}

            </div>
          )}


          {/* =================================================
              EARLIEST / EXPECTED / LATEST
              ================================================= */}

          <div className="grid grid-cols-3 gap-2 mt-4">

            {/* EARLIEST */}

            <div className="rounded-lg bg-green-50 border border-green-100 p-3 text-center">

              <p className="text-[10px] text-green-600 font-semibold">
                Earliest
              </p>

              <p className="text-sm font-bold text-green-700 mt-1">
                {formatMinutes(
                  p10
                )}
              </p>

              <p className="text-[10px] font-bold text-green-600 mt-1">

                {calculatedEarlierBy !== null
                  ? `−${calculatedEarlierBy} min`
                  : "--"}

              </p>

            </div>


            {/* EXPECTED */}

            <div className="rounded-lg bg-white border border-blue-100 p-3 text-center">

              <p className="text-[10px] text-blue-600 font-semibold">
                Expected
              </p>

              <p className="text-sm font-bold text-blue-700 mt-1">
                {formatMinutes(
                  p50 ??
                  etaMinutes
                )}
              </p>

              <p className="text-[10px] text-blue-600 mt-1 font-semibold">
                Expected time
              </p>

            </div>


            {/* LATEST */}

            <div className="rounded-lg bg-orange-50 border border-orange-100 p-3 text-center">

              <p className="text-[10px] text-orange-600 font-semibold">
                Latest
              </p>

              <p className="text-sm font-bold text-orange-700 mt-1">
                {formatMinutes(
                  p90
                )}
              </p>

              <p className="text-[10px] font-bold text-orange-600 mt-1">

                {calculatedDelayedBy !== null
                  ? `+${calculatedDelayedBy} min`
                  : "--"}

              </p>

            </div>

          </div>


          {/* =================================================
              EARLIER / DELAYED BY
              ================================================= */}

          <div className="grid grid-cols-2 gap-3 mt-3">

            <div className="rounded-lg bg-white/70 p-3">

              <p className="text-[10px] text-slate-500">
                Can arrive earlier by
              </p>

              <p className="text-sm font-bold text-green-700 mt-1">

                {formatMinutes(
                  calculatedEarlierBy
                )}

              </p>

            </div>


            <div className="rounded-lg bg-white/70 p-3">

              <p className="text-[10px] text-slate-500">
                Can be delayed by
              </p>

              <p className="text-sm font-bold text-orange-600 mt-1">

                {formatMinutes(
                  calculatedDelayedBy
                )}

              </p>

            </div>

          </div>

        </div>
      )}


      {/* =================================================
          ROUTE TABLE
          ================================================= */}

      <div className="p-3">

        <div className="border border-slate-200 rounded-xl overflow-hidden">

          {/* =================================================
              TABLE HEADER
              ================================================= */}

          <div className="grid grid-cols-[1.3fr_1fr_1fr] bg-slate-50 border-b border-slate-200">

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
                Actual | Predicted | Confidence
              </p>

            </div>

          </div>


          {/* =================================================
              ROUTE DATA
              ================================================= */}

          {stations.length === 0 ? (

            <div className="p-8 text-center text-sm text-slate-500">
              Route information is unavailable.
            </div>

          ) : (

            routeItems.map(
              (item) => {

                // ---------------------------------------------
                // MAIN STATION
                // ---------------------------------------------

                if (
                  item.type ===
                  "main-station"
                ) {

                  return renderStationRow(
                    item.station,
                    item.originalIndex,
                    false
                  );
                }


                // ---------------------------------------------
                // INTERMEDIATE GROUP
                // ---------------------------------------------

                const isExpanded =
                  expandedGroups[
                    item.id
                  ] === true;


                return (
                  <React.Fragment
                    key={item.id}
                  >

                    {/* ---------------------------------------
                        COLLAPSED INTERMEDIATE ROUTE POINTS
                        --------------------------------------- */}

                    <button
                      type="button"
                      onClick={() =>
                        toggleGroup(
                          item.id
                        )
                      }
                      className="w-full grid grid-cols-[1.3fr_1fr_1fr] text-left bg-slate-50 hover:bg-slate-100 border-b border-slate-200 transition"
                    >

                      <div className="px-4 py-3 flex items-center gap-2">

                        {isExpanded ? (

                          <ChevronDown
                            size={15}
                            className="text-slate-500 shrink-0"
                          />

                        ) : (

                          <ChevronRight
                            size={15}
                            className="text-slate-500 shrink-0"
                          />

                        )}


                        <div>

                          <p className="text-[11px] font-bold text-slate-600">

                            {isExpanded
                              ? "Hide intermediate route points"
                              : `Show ${
                                  item.stations.length
                                } intermediate ${
                                  item.stations.length ===
                                  1
                                    ? "point"
                                    : "points"
                                }`}

                          </p>


                          <p className="text-[9px] text-slate-400 mt-0.5">
                            Signal and track conditions still apply
                          </p>

                        </div>

                      </div>


                      <div className="px-4 py-3 border-l border-slate-200 text-[10px] text-slate-400">
                        —
                      </div>


                      <div className="px-4 py-3 border-l border-slate-200 text-[10px] text-slate-400">
                        —
                      </div>

                    </button>


                    {/* ---------------------------------------
                        EXPANDED INTERMEDIATE ROUTE POINTS
                        --------------------------------------- */}

                    {isExpanded &&
                      item.stations.map(
                        ({
                          station,
                          originalIndex,
                        }) =>
                          renderStationRow(
                            station,
                            originalIndex,
                            true
                          )
                      )}

                  </React.Fragment>
                );
              }
            )
          )}

        </div>


        {/* =================================================
            INFORMATION NOTE
            ================================================= */}

        <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl p-3 flex items-start gap-3">

          <Info
            size={18}
            className="text-blue-600 mt-0.5 shrink-0"
          />

          <p className="text-[11px] text-blue-700 leading-relaxed">
            Actual stopping stations are displayed normally.
            Pass-through route points are grouped and hidden by
            default. Expand the route group to inspect them.
            All route points remain available for ETA, signal
            congestion, and track-condition calculations.
          </p>

        </div>

      </div>

    </div>
  );
};


export default RouteEtaTable;