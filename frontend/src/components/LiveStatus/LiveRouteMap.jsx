import React, { useEffect, useMemo, useState } from "react";

import {
  MapPin,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock3,
  Radio,
  TrainFront,
  X,
} from "lucide-react";

const API_BASE_URL = "http://localhost:8000/api/v1";

const CONDITION_CONFIG = {
  CLEAR: {
    label: "Clear",
    color: "#22c55e",
    background: "#f0fdf4",
    border: "#86efac",
    description: "Normal track condition with low congestion.",
  },
  MODERATE: {
    label: "Moderate",
    color: "#eab308",
    background: "#fefce8",
    border: "#fde047",
    description: "Moderate congestion may slightly affect movement.",
  },
  RESTRICTION: {
    label: "Restriction",
    color: "#f97316",
    background: "#fff7ed",
    border: "#fdba74",
    description: "Possible speed restriction or weather-related impact.",
  },
  HEAVY: {
    label: "Heavy",
    color: "#ef4444",
    background: "#fef2f2",
    border: "#fca5a5",
    description: "Heavy signal or track congestion in this section.",
  },
  UNKNOWN: {
    label: "Unknown",
    color: "#94a3b8",
    background: "#f8fafc",
    border: "#cbd5e1",
    description: "Condition information is unavailable.",
  },
};

const getStationObject = (station) => {
  if (!station || typeof station !== "object") {
    return {};
  }

  return station.station || station;
};

const getStationName = (station) => {
  const stationObject = getStationObject(station);

  return (
    stationObject.name ||
    stationObject.stationName ||
    station.name ||
    station.stationName ||
    station.code ||
    station.stationCode ||
    "Route point"
  );
};

const getStationCode = (station) => {
  const stationObject = getStationObject(station);

  return (
    stationObject.code ||
    stationObject.stationCode ||
    station.code ||
    station.stationCode ||
    ""
  );
};

const isStoppingStation = (station) => {
  return (
    station?.isHalt === true ||
    station?.halt === true ||
    station?.station?.isHalt === true
  );
};

const getCongestionScore = (congestion) => {
  const score = Number(
    congestion?.congestion_score ??
      congestion?.score ??
      0
  );

  return Number.isFinite(score) ? Math.max(0, Math.min(score, 100)) : 0;
};

const getBaseCondition = (congestion) => {
  const level = String(
    congestion?.congestion_level || ""
  ).toUpperCase();

  const score = getCongestionScore(congestion);

  if (level === "HIGH" || score >= 70) {
    return "HEAVY";
  }

  if (level === "MODERATE" || score >= 40) {
    return "MODERATE";
  }

  if (score > 0) {
    return "CLEAR";
  }

  return "UNKNOWN";
};

/*
 * This creates a clean schematic railway corridor.
 * It is intentionally not a geographical map.
 */
const createSchematicPoints = (stations) => {
  if (!Array.isArray(stations) || stations.length === 0) {
    return [];
  }

  const total = stations.length;

  return stations.map((station, index) => {
    const progress = total === 1 ? 0 : index / (total - 1);

    const x = 35 + progress * 930;

    const y =
      150 +
      Math.sin(progress * Math.PI * 2) * 28;

    return {
      station,
      index,
      name: getStationName(station),
      code: getStationCode(station),
      isHalt: isStoppingStation(station),
      x,
      y,
    };
  });
};

/*
 * The current backend returns one overall congestion record.
 * Until the backend exposes individual section records, this
 * function creates a visual section-wise prototype using that
 * overall score. The horizontal map and all route points remain.
 */
const getSegmentCondition = (
  baseCondition,
  baseScore,
  segmentIndex,
  totalSegments
) => {
  if (!baseCondition || baseCondition === "UNKNOWN") {
    return {
      key: "UNKNOWN",
      score: null,
      source: "Unavailable",
    };
  }

  const progress =
    totalSegments <= 1
      ? 0
      : segmentIndex / (totalSegments - 1);

  /*
   * Keep most sections close to the backend condition while
   * allowing visible variation along the schematic route.
   */
  const variationPattern = [
    0,
    -12,
    8,
    -5,
    15,
    -8,
    5,
  ];

  const variation =
    variationPattern[segmentIndex % variationPattern.length];

  const adjustedScore = Math.max(
    0,
    Math.min(100, baseScore + variation + progress * 3)
  );

  let key = "CLEAR";

  if (adjustedScore >= 70) {
    key = "HEAVY";
  } else if (adjustedScore >= 55) {
    key = "RESTRICTION";
  } else if (adjustedScore >= 40) {
    key = "MODERATE";
  } else {
    key = "CLEAR";
  }

  return {
    key,
    score: Math.round(adjustedScore),
    source: "Prototype section visualization",
  };
};

const findCurrentPoint = (points, live) => {
  if (!points.length) {
    return null;
  }

  const currentLocation = String(
    live?.currentLocation || ""
  ).toLowerCase();

  const matchedPoint = points.find((point) => {
    const name = point.name.toLowerCase();
    const code = point.code.toLowerCase();

    return (
      currentLocation.includes(name) ||
      (code && currentLocation.includes(code))
    );
  });

  return matchedPoint || points[0];
};

const LegendItem = ({ color, label }) => {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="h-2.5 w-7 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span className="text-[10px] text-slate-500">
        {label}
      </span>
    </div>
  );
};

const LiveRouteMap = ({
  train,
  live,
  stations = [],
}) => {
  const [congestion, setCongestion] = useState(null);
  const [congestionLoading, setCongestionLoading] =
    useState(true);
  const [congestionError, setCongestionError] =
    useState("");
  const [selectedSegment, setSelectedSegment] =
    useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadCongestion = async () => {
      const trainNumber =
        train?.number ||
        train?.trainNumber ||
        train?.train_number;

      if (!trainNumber) {
        setCongestionLoading(false);
        setCongestionError(
          "Train number is unavailable."
        );
        return;
      }

      try {
        setCongestionLoading(true);
        setCongestionError("");

        const response = await fetch(
          `${API_BASE_URL}/signal-congestion/live/${trainNumber}`
        );

        if (!response.ok) {
          throw new Error(
            "Signal congestion data unavailable."
          );
        }

        const result = await response.json();

        if (isMounted) {
          setCongestion(
            result.congestion ||
              result.data ||
              null
          );
        }
      } catch (error) {
        console.warn(
          "Unable to load signal congestion:",
          error
        );

        if (isMounted) {
          setCongestion(null);
          setCongestionError(
            "Congestion data unavailable."
          );
        }
      } finally {
        if (isMounted) {
          setCongestionLoading(false);
        }
      }
    };

    loadCongestion();

    return () => {
      isMounted = false;
    };
  }, [
    train?.number,
    train?.trainNumber,
    train?.train_number,
  ]);

  const routePoints = useMemo(() => {
    return createSchematicPoints(stations);
  }, [stations]);

  const currentPoint = useMemo(() => {
    return findCurrentPoint(routePoints, live);
  }, [routePoints, live]);

  const baseCondition = getBaseCondition(congestion);
  const baseScore = getCongestionScore(congestion);

  const congestionConfig =
    CONDITION_CONFIG[baseCondition] ||
    CONDITION_CONFIG.UNKNOWN;

  const estimatedSignalWait =
    congestion?.estimated_signal_wait_min ??
    null;

  const dataSource =
    congestion?.data_source || "Unavailable";

  const segments = useMemo(() => {
    if (routePoints.length < 2) {
      return [];
    }

    return routePoints.slice(0, -1).map((point, index) => {
      const nextPoint = routePoints[index + 1];

      const condition = getSegmentCondition(
        baseCondition,
        baseScore,
        index,
        routePoints.length - 1
      );

      return {
        id: `${point.code || point.index}-${nextPoint.code || nextPoint.index}`,
        index,
        from: point,
        to: nextPoint,
        condition,
      };
    });
  }, [routePoints, baseCondition, baseScore]);

  const handleSegmentClick = (segment) => {
    setSelectedSegment(segment);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">
              <MapPin
                size={20}
                className="text-blue-600"
              />
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900">
                Live Route
              </h2>

              <p className="text-[10px] text-slate-400 mt-0.5">
                {train?.from || "Origin"} →{" "}
                {train?.to || "Destination"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[10px] text-slate-500">
            <Radio
              size={13}
              className="text-blue-500"
            />
            Route status
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 mt-3">
          <LegendItem
            color="#22c55e"
            label="Clear"
          />

          <LegendItem
            color="#eab308"
            label="Moderate"
          />

          <LegendItem
            color="#f97316"
            label="Restriction"
          />

          <LegendItem
            color="#ef4444"
            label="Heavy"
          />
        </div>
      </div>

      {/* Schematic map */}
      <div className="px-3 pt-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
          {routePoints.length >= 2 ? (
            <svg
              viewBox="0 0 1000 300"
              width="100%"
              height="300"
              role="img"
              aria-label="Interactive schematic live railway route"
            >
              <defs>
                <pattern
                  id="routeGrid"
                  width="32"
                  height="32"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 32 0 L 0 0 0 32"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>

              {/* Background */}
              <rect
                width="1000"
                height="300"
                fill="#f8fafc"
              />

              <rect
                width="1000"
                height="300"
                fill="url(#routeGrid)"
              />

              {/* Guide lines */}
              <line
                x1="20"
                y1="95"
                x2="980"
                y2="95"
                stroke="#dbeafe"
                strokeWidth="1"
                strokeDasharray="5 8"
              />

              <line
                x1="20"
                y1="205"
                x2="980"
                y2="205"
                stroke="#dbeafe"
                strokeWidth="1"
                strokeDasharray="5 8"
              />

              {/* White track outline */}
              <polyline
                points={routePoints
                  .map(
                    (point) =>
                      `${point.x},${point.y}`
                  )
                  .join(" ")}
                fill="none"
                stroke="#ffffff"
                strokeWidth="18"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Individual colored segments */}
              {segments.map((segment) => {
                const config =
                  CONDITION_CONFIG[
                    segment.condition.key
                  ] || CONDITION_CONFIG.UNKNOWN;

                return (
                  <g key={segment.id}>
                    {/* Wider invisible hit area */}
                    <line
                      x1={segment.from.x}
                      y1={segment.from.y}
                      x2={segment.to.x}
                      y2={segment.to.y}
                      stroke="transparent"
                      strokeWidth="28"
                      strokeLinecap="round"
                      style={{
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        handleSegmentClick(segment)
                      }
                    />

                    {/* Visible condition segment */}
                    <line
                      x1={segment.from.x}
                      y1={segment.from.y}
                      x2={segment.to.x}
                      y2={segment.to.y}
                      stroke={config.color}
                      strokeWidth={
                        selectedSegment?.id === segment.id
                          ? 13
                          : 9
                      }
                      strokeLinecap="round"
                      style={{
                        cursor: "pointer",
                        transition:
                          "stroke-width 0.2s ease",
                      }}
                      onClick={() =>
                        handleSegmentClick(segment)
                      }
                    />
                  </g>
                );
              })}

              {/* Rail sleepers */}
              {routePoints
                .filter((point, index) => index % 2 === 0)
                .map((point) => (
                  <line
                    key={`sleeper-${point.index}`}
                    x1={point.x}
                    y1={point.y - 9}
                    x2={point.x}
                    y2={point.y + 9}
                    stroke="#64748b"
                    strokeWidth="2"
                    opacity="0.55"
                  />
                ))}

              {/* Station and halt points */}
              {routePoints.map((point) => (
                <g key={`station-${point.index}`}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={point.isHalt ? 9 : 4}
                    fill={
                      point.isHalt
                        ? "#dbeafe"
                        : "#cbd5e1"
                    }
                    stroke={
                      point.isHalt
                        ? "#2563eb"
                        : "#64748b"
                    }
                    strokeWidth={
                      point.isHalt ? 3 : 1.5
                    }
                  />

                  {/* Labels only for main stations */}
                  {point.isHalt && (
                    <>
                      <line
                        x1={point.x}
                        y1={point.y - 11}
                        x2={point.x}
                        y2={point.y - 32}
                        stroke="#94a3b8"
                        strokeWidth="1.5"
                      />

                      <text
                        x={point.x}
                        y={point.y - 39}
                        textAnchor="middle"
                        fontSize="12"
                        fontWeight="700"
                        fill="#334155"
                      >
                        {point.name.length > 17
                          ? `${point.name.slice(0, 17)}…`
                          : point.name}
                      </text>

                      {point.code && (
                        <text
                          x={point.x}
                          y={point.y - 24}
                          textAnchor="middle"
                          fontSize="9"
                          fill="#64748b"
                        >
                          {point.code}
                        </text>
                      )}
                    </>
                  )}
                </g>
              ))}

              {/* Current train marker */}
              {currentPoint && (
                <g>
                  <circle
                    cx={currentPoint.x}
                    cy={currentPoint.y}
                    r="25"
                    fill="#2563eb"
                    opacity="0.13"
                  />

                  <circle
                    cx={currentPoint.x}
                    cy={currentPoint.y}
                    r="19"
                    fill="#2563eb"
                    stroke="#ffffff"
                    strokeWidth="4"
                  />

                  <text
                    x={currentPoint.x}
                    y={currentPoint.y + 7}
                    textAnchor="middle"
                    fontSize="19"
                  >
                    🚆
                  </text>
                </g>
              )}

              {/* Start and destination labels */}
              <text
                x="25"
                y="275"
                fontSize="11"
                fontWeight="700"
                fill="#64748b"
              >
                START
              </text>

              <text
                x="975"
                y="275"
                textAnchor="end"
                fontSize="11"
                fontWeight="700"
                fill="#64748b"
              >
                DESTINATION
              </text>
            </svg>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-sm text-slate-500">
              Route points are unavailable.
            </div>
          )}
        </div>

        <p className="text-[10px] text-slate-400 mt-2 px-1">
          Click any colored route segment to inspect its
          track and signal condition.
        </p>
      </div>

      {/* Selected segment details */}
      {selectedSegment && (
        <div className="px-3 pt-3">
          <div
            className="rounded-xl border p-3"
            style={{
              backgroundColor:
                CONDITION_CONFIG[
                  selectedSegment.condition.key
                ]?.background || "#f8fafc",
              borderColor:
                CONDITION_CONFIG[
                  selectedSegment.condition.key
                ]?.border || "#cbd5e1",
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] text-slate-500">
                  Selected route section
                </p>

                <p className="text-sm font-bold text-slate-900 mt-1">
                  {selectedSegment.from.name} →{" "}
                  {selectedSegment.to.name}
                </p>

                <p
                  className="text-xs font-bold mt-1"
                  style={{
                    color:
                      CONDITION_CONFIG[
                        selectedSegment.condition.key
                      ]?.color,
                  }}
                >
                  {
                    CONDITION_CONFIG[
                      selectedSegment.condition.key
                    ]?.label
                  }
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSegment(null)}
                className="h-7 w-7 rounded-full bg-white/80 flex items-center justify-center text-slate-500 hover:text-slate-900"
                aria-label="Close selected segment details"
              >
                <X size={15} />
              </button>
            </div>

            <p className="text-[10px] text-slate-500 mt-2">
              {
                CONDITION_CONFIG[
                  selectedSegment.condition.key
                ]?.description
              }
            </p>

            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="rounded-lg bg-white/75 p-2">
                <p className="text-[10px] text-slate-500">
                  Section score
                </p>

                <p className="text-sm font-bold text-slate-800 mt-1">
                  {selectedSegment.condition.score ?? "--"}
                </p>
              </div>

              <div className="rounded-lg bg-white/75 p-2">
                <p className="text-[10px] text-slate-500">
                  Data source
                </p>

                <p className="text-sm font-bold text-slate-800 mt-1">
                  {selectedSegment.condition.source}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Overall condition */}
      <div className="p-3">
        <div
          className="rounded-xl border p-3"
          style={{
            borderColor: congestionConfig.border,
            backgroundColor: congestionConfig.background,
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              {baseCondition === "HEAVY" ? (
                <AlertTriangle
                  size={20}
                  style={{
                    color: congestionConfig.color,
                  }}
                />
              ) : (
                <CheckCircle
                  size={20}
                  style={{
                    color: congestionConfig.color,
                  }}
                />
              )}

              <div>
                <p className="text-xs font-bold text-slate-800">
                  Track and Signal Condition
                </p>

                <p
                  className="text-sm font-bold mt-1"
                  style={{
                    color: congestionConfig.color,
                  }}
                >
                  {congestionLoading
                    ? "Loading..."
                    : congestionConfig.label}
                </p>

                <p className="text-[10px] text-slate-500 mt-1">
                  {congestionLoading
                    ? "Fetching congestion information"
                    : congestionConfig.description}
                </p>
              </div>
            </div>

            {congestion && (
              <div className="text-right">
                <p className="text-[10px] text-slate-500">
                  Score
                </p>

                <p
                  className="text-lg font-bold"
                  style={{
                    color: congestionConfig.color,
                  }}
                >
                  {baseScore}
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="rounded-lg bg-white/75 p-2">
              <div className="flex items-center gap-1.5">
                <Clock3
                  size={14}
                  className="text-slate-500"
                />

                <p className="text-[10px] text-slate-500">
                  Estimated signal wait
                </p>
              </div>

              <p className="text-sm font-bold text-slate-800 mt-1">
                {estimatedSignalWait !== null
                  ? `${estimatedSignalWait} min`
                  : "--"}
              </p>
            </div>

            <div className="rounded-lg bg-white/75 p-2">
              <div className="flex items-center gap-1.5">
                <Activity
                  size={14}
                  className="text-slate-500"
                />

                <p className="text-[10px] text-slate-500">
                  Data source
                </p>
              </div>

              <p className="text-sm font-bold text-slate-800 mt-1">
                {dataSource}
              </p>
            </div>
          </div>

          {congestionError && (
            <p className="text-[10px] text-slate-500 mt-2">
              {congestionError}
            </p>
          )}

          <p className="text-[10px] text-slate-400 mt-2">
            Section colors are currently a prototype visualization
            based on the overall congestion response.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LiveRouteMap;