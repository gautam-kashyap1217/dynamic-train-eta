import React, { useEffect, useMemo, useState } from "react";

import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock3,
  Gauge,
  MapPin,
  Radio,
  RefreshCw,
  ShieldCheck,
  TrainFront,
  UserCheck,
  XCircle,
  Zap,
} from "lucide-react";

import { getLiveTrainStatus } from "../services/liveStatusApi";

const DEFAULT_TRAIN_NUMBER = "12002";

const ControllerDashboard = () => {
  const [trainNumber, setTrainNumber] = useState(
    DEFAULT_TRAIN_NUMBER
  );

  const [searchInput, setSearchInput] = useState(
    DEFAULT_TRAIN_NUMBER
  );

  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [reviewStatus, setReviewStatus] =
    useState("Pending Review");

  const [actionLog, setActionLog] = useState([]);

  const [lastSync, setLastSync] = useState(null);

  // =========================================================
  // LOAD TRAIN DATA
  // =========================================================

  const loadTrainData = async (
    requestedTrain = trainNumber
  ) => {
    try {
      setLoading(true);
      setError("");

      const result =
        await getLiveTrainStatus(
          requestedTrain
        );

      if (!result) {
        throw new Error(
          "No train data was returned by the server."
        );
      }

      setData(result);

      setLastSync(new Date());

      /*
       * Every fresh prediction starts as pending
       * controller verification.
       */
      setReviewStatus("Pending Review");

    } catch (err) {
      console.error(
        "Controller dashboard error:",
        err
      );

      setError(
        err.message ||
          "Unable to load train information."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadTrainData();
  }, []);

  // =========================================================
  // HELPERS
  // =========================================================

  const train =
    data?.train || {};

  const live =
    data?.live || {};

  const prediction =
    data?.prediction || {};

  const delayReason =
    data?.delayReason || {};

  const stations =
    Array.isArray(data?.stations)
      ? data.stations
      : [];

  const trainName =
    train.name ||
    train.trainName ||
    "Train";

  const currentLocation =
    live.currentLocation ||
    "Information unavailable";

  const nextStation =
    live.nextStation ||
    prediction.nextStation ||
    "Information unavailable";

  const speed =
    live.speed ??
    prediction.speedKmph ??
    0;

  const delay =
    live.delay ??
    0;

  const confidence =
    prediction.confidence_percentage ??
    prediction.confidence ??
    live.confidence_percentage ??
    live.confidence ??
    0;

  const predictionMinutes =
    prediction.predictedMinutes ??
    prediction.etaMinutes ??
    prediction.travelTimeMinutes ??
    prediction.p50 ??
    null;

  const predictionRange =
    prediction.predictionRange ||
    prediction.confidenceWindow ||
    null;

  const congestion =
    prediction.congestionLevel ||
    live.congestionLevel ||
    prediction.congestion ||
    "Unknown";

  // =========================================================
  // PREDICTION STATUS
  // =========================================================

  const numericConfidence = Number(
    confidence
  );

  const confidenceLabel =
    numericConfidence >= 80
      ? "High"
      : numericConfidence >= 65
      ? "Moderate"
      : "Low";

  const confidenceClass =
    numericConfidence >= 80
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : numericConfidence >= 65
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-red-50 text-red-700 border-red-200";

  const delayValue = Number(delay) || 0;

  const operationalStatus =
    delayValue >= 15
      ? "Attention Required"
      : delayValue >= 5
      ? "Monitor"
      : "Normal";

  const operationalStatusClass =
    delayValue >= 15
      ? "bg-red-50 text-red-700 border-red-200"
      : delayValue >= 5
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-emerald-50 text-emerald-700 border-emerald-200";

  // =========================================================
  // PREDICTION VALIDATION HELPERS
  // =========================================================

  /*
   * The backend/project may use different field names for
   * predicted and actual station arrival values.
   *
   * We intentionally support several existing naming patterns
   * without creating artificial actual-arrival data.
   */

  const getStationName = (station) => {
    if (!station) {
      return "Unknown Station";
    }

    return (
      station.stationName ||
      station.name ||
      station.station ||
      station.station_code ||
      station.stationCode ||
      "Unknown Station"
    );
  };

  const getStationCode = (station) => {
    if (!station) {
      return "";
    }

    return (
      station.stationCode ||
      station.station_code ||
      station.code ||
      ""
    );
  };

  const getPredictedArrival = (station) => {
    if (!station) {
      return null;
    }

    return (
      station.arrivalPredicted ??
      station.predictedArrival ??
      station.predicted_arrival ??
      station.estimatedArrival ??
      station.estimated_arrival ??
      station.arrival_prediction ??
      null
    );
  };

  const getActualArrival = (station) => {
    if (!station) {
      return null;
    }

    return (
      station.arrivalActual ??
      station.actualArrival ??
      station.actual_arrival ??
      station.arrival_actual ??
      station.arrivedAt ??
      station.arrived_at ??
      null
    );
  };

  /*
   * Convert common clock-time strings such as:
   *
   * 11:45
   * 11:45 AM
   * 23:45
   *
   * into minutes from midnight.
   */
  const parseClockTime = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return null;
    }

    if (
      typeof value === "number" &&
      Number.isFinite(value)
    ) {
      return value;
    }

    const text = String(value).trim();

    const match = text.match(
      /^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i
    );

    if (!match) {
      return null;
    }

    let hours = Number(match[1]);

    const minutes = Number(match[2]);

    const meridiem = match[4]
      ? match[4].toUpperCase()
      : null;

    if (
      meridiem === "PM" &&
      hours < 12
    ) {
      hours += 12;
    }

    if (
      meridiem === "AM" &&
      hours === 12
    ) {
      hours = 0;
    }

    if (
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59
    ) {
      return null;
    }

    return (
      hours * 60 +
      minutes
    );
  };

  const calculateArrivalError = (
    predicted,
    actual
  ) => {
    const predictedMinutes =
      parseClockTime(predicted);

    const actualMinutes =
      parseClockTime(actual);

    if (
      predictedMinutes === null ||
      actualMinutes === null
    ) {
      return null;
    }

    let difference =
      actualMinutes -
      predictedMinutes;

    /*
     * Handle midnight crossover.
     *
     * Example:
     * predicted = 23:58
     * actual    = 00:03
     *
     * Actual error should be +5 min rather than -1435 min.
     */
    if (difference < -720) {
      difference += 1440;
    }

    if (difference > 720) {
      difference -= 1440;
    }

    return difference;
  };

  // =========================================================
  // VALIDATION DATA
  // =========================================================

  const validationRows = useMemo(() => {
    return stations.map(
      (station, index) => {
        const predicted =
          getPredictedArrival(
            station
          );

        const actual =
          getActualArrival(
            station
          );

        const errorMinutes =
          calculateArrivalError(
            predicted,
            actual
          );

        return {
          id:
            getStationCode(
              station
            ) ||
            `${getStationName(
              station
            )}-${index}`,

          station:
            getStationName(
              station
            ),

          code:
            getStationCode(
              station
            ),

          predicted,

          actual,

          errorMinutes,

          validated:
            errorMinutes !== null,
        };
      }
    );
  }, [stations]);

  const validatedRows =
    validationRows.filter(
      (row) => row.validated
    );

  const pendingRows =
    validationRows.filter(
      (row) => !row.validated
    );

  const averagePredictionError =
    validatedRows.length > 0
      ? validatedRows.reduce(
          (sum, row) =>
            sum +
            Math.abs(
              row.errorMinutes
            ),
          0
        ) /
        validatedRows.length
      : null;

  const validationStatus =
    validatedRows.length === 0
      ? "Awaiting Actual Arrivals"
      : averagePredictionError <= 5
      ? "Within Validation Range"
      : "Requires Review";

  const validationStatusClass =
    validatedRows.length === 0
      ? "bg-slate-50 text-slate-600 border-slate-200"
      : averagePredictionError <= 5
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-amber-50 text-amber-700 border-amber-200";

  // =========================================================
  // CONTROLLER ACTIONS
  // =========================================================

  const addAction = (
    message,
    type = "info"
  ) => {
    setActionLog((previous) => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        message,
        type,
      },
      ...previous,
    ]);
  };

  const handleVerify = () => {
    setReviewStatus(
      "Prediction Verified"
    );

    addAction(
      `Controller verified the AI ETA for train ${
        train.number || trainNumber
      }.`,
      "success"
    );
  };

  const handleFlag = () => {
    setReviewStatus(
      "Prediction Flagged"
    );

    addAction(
      `Controller flagged the prediction for train ${
        train.number || trainNumber
      } for further review.`,
      "warning"
    );
  };

  const handleRecalculate = async () => {
    setReviewStatus(
      "Recalculating..."
    );

    addAction(
      `Recalculation requested for train ${
        train.number || trainNumber
      }.`,
      "info"
    );

    await loadTrainData(
      train.number ||
        trainNumber
    );

    setReviewStatus(
      "Pending Review"
    );
  };

  const handleStationAlert = () => {
    addAction(
      `Station alert generated for ${
        nextStation
      } regarding train ${
        train.number || trainNumber
      }.`,
      "warning"
    );
  };

  const handleOperationsAlert = () => {
    addAction(
      `Operations team notified about the predicted ${
        delayValue
      } min delay.`,
      "warning"
    );
  };

  const handleValidationReview = () => {
    addAction(
      `Controller reviewed prediction validation for train ${
        train.number || trainNumber
      }.`,
      "success"
    );
  };

  // =========================================================
  // TRAIN SEARCH
  // =========================================================

  const handleSearch = (event) => {
    event.preventDefault();

    const cleaned =
      searchInput.trim();

    if (!cleaned) {
      return;
    }

    setTrainNumber(cleaned);

    loadTrainData(cleaned);
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />

          <p className="text-sm text-slate-500 mt-4">
            Loading controller dashboard...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error && !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center max-w-md w-full">
          <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center mx-auto">
            <AlertTriangle
              size={24}
              className="text-red-500"
            />
          </div>

          <h2 className="mt-4 text-lg font-bold text-slate-900">
            Controller data unavailable
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              loadTrainData()
            }
            className="mt-5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <header className="bg-white border-b border-slate-200">
        <div className="max-w-[1480px] mx-auto px-6 py-4">

          <div className="flex items-center justify-between gap-4">

            <div className="flex items-center gap-3">

              <div className="h-11 w-11 rounded-xl bg-blue-600 flex items-center justify-center">
                <ShieldCheck
                  size={23}
                  className="text-white"
                />
              </div>

              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Railway Control Center
                </h1>

                <p className="text-xs text-slate-500 mt-0.5">
                  AI-assisted train monitoring and ETA verification
                </p>
              </div>

            </div>

            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-emerald-50 border border-emerald-200">

              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />

              <Radio
                size={14}
                className="text-emerald-600"
              />

              <span className="text-xs font-bold text-emerald-700">
                LIVE MONITORING
              </span>

            </div>

          </div>

        </div>
      </header>



      <main className="max-w-[1480px] mx-auto px-6 py-5">

        {/* =====================================================
            TRAIN SEARCH
            ===================================================== */}

        <form
          onSubmit={handleSearch}
          className="bg-white border border-slate-200 rounded-2xl p-4"
        >

          <div className="flex flex-col md:flex-row md:items-end gap-3">

            <div className="flex-1">

              <label className="block text-xs font-bold text-slate-600 mb-2">
                Monitor Train
              </label>

              <input
                type="text"
                value={searchInput}
                onChange={(event) =>
                  setSearchInput(
                    event.target.value
                  )
                }
                placeholder="Enter train number"
                className="w-full h-11 px-4 rounded-lg border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm"
              />

            </div>

            <button
              type="submit"
              className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold"
            >
              Monitor Train
            </button>

            <button
              type="button"
              onClick={() =>
                loadTrainData()
              }
              disabled={loading}
              className="h-11 px-4 border border-slate-200 hover:bg-slate-50 rounded-lg text-sm font-semibold text-slate-700 flex items-center justify-center gap-2"
            >
              <RefreshCw
                size={15}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />
              Refresh
            </button>

          </div>

        </form>



        {/* =====================================================
            TRAIN HEADER
            ===================================================== */}

        <div className="mt-4 bg-white border border-slate-200 rounded-2xl p-5">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

            <div className="flex items-center gap-4">

              <div className="h-14 w-14 rounded-xl bg-blue-50 flex items-center justify-center">
                <TrainFront
                  size={28}
                  className="text-blue-600"
                />
              </div>

              <div>

                <div className="flex items-center gap-3 flex-wrap">

                  <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-sm font-bold">
                    {train.number ||
                      trainNumber}
                  </span>

                  <h2 className="text-xl font-bold text-slate-900">
                    {trainName}
                  </h2>

                </div>

                <p className="text-sm text-slate-500 mt-1">
                  {train.from ||
                    "Origin"}{" "}
                  →{" "}
                  {train.to ||
                    "Destination"}
                </p>

              </div>

            </div>

            <div className="flex items-center gap-2">

              <span
                className={`px-3 py-2 rounded-lg border text-xs font-bold ${operationalStatusClass}`}
              >
                {operationalStatus}
              </span>

              <span className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600">
                Last sync:{" "}
                {lastSync
                  ? lastSync.toLocaleTimeString()
                  : "—"}
              </span>

            </div>

          </div>

        </div>



        {/* =====================================================
            CONTROL CENTER STATS
            ===================================================== */}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">

          <div className="bg-white border border-slate-200 rounded-xl p-4">

            <div className="flex items-center gap-2">

              <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <MapPin
                  size={18}
                  className="text-blue-600"
                />
              </div>

              <span className="text-xs font-semibold text-slate-500">
                Current Location
              </span>

            </div>

            <p className="mt-3 text-lg font-bold text-slate-900">
              {currentLocation}
            </p>

          </div>



          <div className="bg-white border border-slate-200 rounded-xl p-4">

            <div className="flex items-center gap-2">

              <div className="h-9 w-9 rounded-lg bg-slate-50 flex items-center justify-center">
                <Gauge
                  size={18}
                  className="text-slate-700"
                />
              </div>

              <span className="text-xs font-semibold text-slate-500">
                Current Speed
              </span>

            </div>

            <p className="mt-3 text-lg font-bold text-slate-900">
              {speed} km/h
            </p>

          </div>



          <div className="bg-white border border-slate-200 rounded-xl p-4">

            <div className="flex items-center gap-2">

              <div className="h-9 w-9 rounded-lg bg-amber-50 flex items-center justify-center">
                <Clock3
                  size={18}
                  className="text-amber-600"
                />
              </div>

              <span className="text-xs font-semibold text-slate-500">
                Current Delay
              </span>

            </div>

            <p className="mt-3 text-lg font-bold text-slate-900">
              {delayValue > 0
                ? `+${delayValue} min`
                : "On time"}
            </p>

          </div>



          <div className="bg-white border border-slate-200 rounded-xl p-4">

            <div className="flex items-center gap-2">

              <div className="h-9 w-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Activity
                  size={18}
                  className="text-emerald-600"
                />
              </div>

              <span className="text-xs font-semibold text-slate-500">
                Model Confidence
              </span>

            </div>

            <p className="mt-3 text-lg font-bold text-slate-900">
              {Number.isFinite(
                numericConfidence
              )
                ? `${Math.round(
                    numericConfidence
                  )}%`
                : "—"}
            </p>

          </div>

        </div>



        {/* =====================================================
            MAIN CONTROL AREA
            ===================================================== */}

        <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-4 mt-4">

          {/* ===================================================
              AI PREDICTION
              =================================================== */}

          <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Zap
                    size={19}
                    className="text-blue-600"
                  />
                </div>

                <div>

                  <h2 className="text-base font-bold text-slate-900">
                    AI ETA Prediction
                  </h2>

                  <p className="text-[10px] text-slate-400">
                    Current ML forecast for operational review
                  </p>

                </div>

              </div>

              <span className="text-xs font-semibold text-blue-600">
                ML ENGINE
              </span>

            </div>



            <div className="p-5">

              <div className="grid grid-cols-2 gap-3">

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">

                  <p className="text-[10px] font-semibold text-blue-600">
                    NEXT STATION
                  </p>

                  <p className="mt-2 text-lg font-bold text-slate-900">
                    {nextStation}
                  </p>

                </div>



                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">

                  <p className="text-[10px] font-semibold text-slate-500">
                    PREDICTED ETA
                  </p>

                  <p className="mt-2 text-lg font-bold text-slate-900">
                    {predictionMinutes !==
                    null
                      ? `${predictionMinutes} min`
                      : "Available in ETA view"}
                  </p>

                </div>

              </div>



              <div className="mt-3 grid grid-cols-2 gap-3">

                <div className="border border-slate-200 rounded-xl p-4">

                  <p className="text-[10px] font-semibold text-slate-500">
                    EXPECTED DELAY
                  </p>

                  <p className="mt-2 text-lg font-bold text-slate-900">
                    {delayValue > 0
                      ? `+${delayValue} min`
                      : "On time"}
                  </p>

                </div>



                <div className="border border-slate-200 rounded-xl p-4">

                  <p className="text-[10px] font-semibold text-slate-500">
                    CONGESTION
                  </p>

                  <p className="mt-2 text-lg font-bold text-slate-900 capitalize">
                    {String(
                      congestion
                    )}
                  </p>

                </div>

              </div>



              {/* Confidence */}

              <div
                className={`mt-3 rounded-xl border p-4 ${confidenceClass}`}
              >

                <div className="flex items-center justify-between gap-4">

                  <div>

                    <p className="text-xs font-bold">
                      Prediction Confidence
                    </p>

                    <p className="text-[10px] mt-1 opacity-80">
                      {confidenceLabel} confidence based on the current prediction uncertainty.
                    </p>

                  </div>

                  <div className="text-2xl font-bold">
                    {Number.isFinite(
                      numericConfidence
                    )
                      ? `${Math.round(
                          numericConfidence
                        )}%`
                      : "—"}
                  </div>

                </div>

              </div>



              {predictionRange && (
                <div className="mt-3 bg-slate-50 border border-slate-200 rounded-xl p-4">

                  <p className="text-[10px] font-bold text-slate-500">
                    PREDICTION RANGE
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {String(
                      predictionRange
                    )}
                  </p>

                </div>
              )}

            </div>

          </section>



          {/* ===================================================
              CONTROLLER VERIFICATION
              =================================================== */}

          <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

            <div className="px-5 py-4 border-b border-slate-100">

              <div className="flex items-center gap-3">

                <div className="h-9 w-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <UserCheck
                    size={19}
                    className="text-emerald-600"
                  />
                </div>

                <div>

                  <h2 className="text-base font-bold text-slate-900">
                    Controller Verification
                  </h2>

                  <p className="text-[10px] text-slate-400">
                    Human-in-the-loop prediction review
                  </p>

                </div>

              </div>

            </div>



            <div className="p-5">

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                <p className="text-[10px] font-bold text-slate-500">
                  REVIEW STATUS
                </p>

                <div className="flex items-center gap-2 mt-2">

                  {reviewStatus ===
                  "Prediction Verified" ? (
                    <CheckCircle2
                      size={18}
                      className="text-emerald-600"
                    />
                  ) : reviewStatus ===
                    "Prediction Flagged" ? (
                    <XCircle
                      size={18}
                      className="text-red-600"
                    />
                  ) : (
                    <AlertTriangle
                      size={18}
                      className="text-amber-600"
                    />
                  )}

                  <span className="text-sm font-bold text-slate-800">
                    {reviewStatus}
                  </span>

                </div>

              </div>



              <div className="mt-4 space-y-2">

                <button
                  type="button"
                  onClick={handleVerify}
                  className="w-full h-10 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2"
                >
                  <CheckCircle2
                    size={15}
                  />
                  Verify Prediction
                </button>



                <button
                  type="button"
                  onClick={handleFlag}
                  className="w-full h-10 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 text-xs font-bold flex items-center justify-center gap-2"
                >
                  <AlertTriangle
                    size={15}
                  />
                  Flag Prediction
                </button>



                <button
                  type="button"
                  onClick={
                    handleRecalculate
                  }
                  className="w-full h-10 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold flex items-center justify-center gap-2"
                >
                  <RefreshCw
                    size={15}
                  />
                  Request Recalculation
                </button>

              </div>



              <div className="mt-4 pt-4 border-t border-slate-200">

                <p className="text-[10px] text-slate-400 leading-relaxed">
                  The controller reviews the AI prediction before operational communication or intervention.
                </p>

              </div>

            </div>

          </section>

        </div>



        {/* =====================================================
            OPERATIONAL RECOMMENDATION
            ===================================================== */}

        <section className="mt-4 bg-white border border-slate-200 rounded-2xl overflow-hidden">

          <div className="px-5 py-4 border-b border-slate-100">

            <div className="flex items-center gap-3">

              <div className="h-9 w-9 rounded-lg bg-amber-50 flex items-center justify-center">
                <AlertTriangle
                  size={19}
                  className="text-amber-600"
                />
              </div>

              <div>

                <h2 className="text-base font-bold text-slate-900">
                  Operational Recommendation
                </h2>

                <p className="text-[10px] text-slate-400">
                  AI-assisted decision support — controller remains in the loop
                </p>

              </div>

            </div>

          </div>



          <div className="p-5">

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">

              <div className="flex items-start gap-3">

                <div className="mt-0.5">
                  <AlertTriangle
                    size={18}
                    className="text-amber-600"
                  />
                </div>

                <div>

                  <p className="text-sm font-bold text-slate-900">
                    {delayValue >= 15
                      ? "Monitor upcoming section closely"
                      : delayValue >= 5
                      ? "Monitor train progression"
                      : "Continue normal monitoring"}
                  </p>

                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {delayValue > 0
                      ? `The system currently predicts a ${delayValue} minute delay. Controller review is recommended before operational communication.`
                      : "Current train conditions do not indicate a significant predicted delay."}
                  </p>

                </div>

              </div>

            </div>



            <div className="flex flex-wrap gap-2 mt-4">

              <button
                type="button"
                onClick={
                  handleStationAlert
                }
                className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
              >
                Send Station Alert
              </button>



              <button
                type="button"
                onClick={
                  handleOperationsAlert
                }
                className="px-4 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold"
              >
                Notify Operations
              </button>

            </div>

          </div>

        </section>



        {/* =====================================================
            ACTION LOG
            ===================================================== */}

        <section className="mt-4 bg-white border border-slate-200 rounded-2xl overflow-hidden">

          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="h-9 w-9 rounded-lg bg-slate-50 flex items-center justify-center">
                <Activity
                  size={19}
                  className="text-slate-600"
                />
              </div>

              <div>

                <h2 className="text-base font-bold text-slate-900">
                  Controller Activity Log
                </h2>

                <p className="text-[10px] text-slate-400">
                  Prototype operational actions
                </p>

              </div>

            </div>

            <span className="text-xs font-semibold text-slate-400">
              {actionLog.length} action
              {actionLog.length === 1
                ? ""
                : "s"}
            </span>

          </div>



          <div className="p-5">

            {actionLog.length === 0 ? (

              <div className="py-7 text-center">

                <Activity
                  size={22}
                  className="text-slate-300 mx-auto"
                />

                <p className="text-xs text-slate-400 mt-2">
                  No controller actions yet.
                </p>

                <p className="text-[10px] text-slate-300 mt-1">
                  Verify, flag or recalculate a prediction to create an activity.
                </p>

              </div>

            ) : (

              <div className="space-y-2">

                {actionLog.map(
                  (action) => (

                    <div
                      key={
                        action.id
                      }
                      className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100"
                    >

                      <div className="mt-0.5">

                        {action.type ===
                        "success" ? (
                          <CheckCircle2
                            size={16}
                            className="text-emerald-600"
                          />
                        ) : action.type ===
                          "warning" ? (
                          <AlertTriangle
                            size={16}
                            className="text-amber-600"
                          />
                        ) : (
                          <Activity
                            size={16}
                            className="text-blue-600"
                          />
                        )}

                      </div>

                      <div className="flex-1">

                        <p className="text-xs font-semibold text-slate-700">
                          {action.message}
                        </p>

                        <p className="text-[10px] text-slate-400 mt-1">
                          {action.time}
                        </p>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </div>

        </section>



        {/* =====================================================
            PREDICTION VALIDATION
            ===================================================== */}

        <section className="mt-4 bg-white border border-slate-200 rounded-2xl overflow-hidden">

          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4">

            <div className="flex items-center gap-3">

              <div className="h-9 w-9 rounded-lg bg-violet-50 flex items-center justify-center">
                <BarChart3
                  size={19}
                  className="text-violet-600"
                />
              </div>

              <div>

                <h2 className="text-base font-bold text-slate-900">
                  Prediction Validation
                </h2>

                <p className="text-[10px] text-slate-400">
                  Compare predicted station arrival with actual arrival
                </p>

              </div>

            </div>

            <span
              className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold ${validationStatusClass}`}
            >
              {validationStatus}
            </span>

          </div>



          <div className="p-5">

            {/* Validation summary */}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">

                <p className="text-[10px] font-semibold text-slate-500">
                  VALIDATED PREDICTIONS
                </p>

                <p className="mt-2 text-xl font-bold text-slate-900">
                  {validatedRows.length}
                </p>

                <p className="text-[10px] text-slate-400 mt-1">
                  Predictions with actual arrival data
                </p>

              </div>



              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">

                <p className="text-[10px] font-semibold text-slate-500">
                  PENDING VALIDATION
                </p>

                <p className="mt-2 text-xl font-bold text-slate-900">
                  {pendingRows.length}
                </p>

                <p className="text-[10px] text-slate-400 mt-1">
                  Waiting for actual arrival
                </p>

              </div>



              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">

                <p className="text-[10px] font-semibold text-slate-500">
                  AVERAGE ABSOLUTE ERROR
                </p>

                <p className="mt-2 text-xl font-bold text-slate-900">
                  {averagePredictionError !==
                  null
                    ? `${averagePredictionError.toFixed(
                        1
                      )} min`
                    : "—"}
                </p>

                <p className="text-[10px] text-slate-400 mt-1">
                  Based only on validated arrivals
                </p>

              </div>

            </div>



            {/* Validation table */}

            <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden">

              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">

                <div className="flex items-center justify-between gap-3">

                  <div>

                    <p className="text-xs font-bold text-slate-800">
                      Station-Level Validation
                    </p>

                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Prediction accuracy is evaluated only when actual arrival data is available.
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={
                      handleValidationReview
                    }
                    className="px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[10px] font-bold flex items-center gap-1.5"
                  >
                    <CheckCircle2
                      size={13}
                    />
                    Review Validation
                  </button>

                </div>

              </div>



              {validationRows.length === 0 ? (

                <div className="py-8 text-center">

                  <BarChart3
                    size={24}
                    className="text-slate-300 mx-auto"
                  />

                  <p className="text-xs font-semibold text-slate-500 mt-2">
                    No station validation data available
                  </p>

                  <p className="text-[10px] text-slate-400 mt-1">
                    Station prediction and actual-arrival records will appear here when provided by the backend.
                  </p>

                </div>

              ) : (

                <div className="overflow-x-auto">

                  <table className="w-full min-w-[700px]">

                    <thead>

                      <tr className="bg-white border-b border-slate-100">

                        <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500">
                          STATION
                        </th>

                        <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500">
                          PREDICTED
                        </th>

                        <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500">
                          ACTUAL
                        </th>

                        <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500">
                          ERROR
                        </th>

                        <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500">
                          STATUS
                        </th>

                      </tr>

                    </thead>



                    <tbody>

                      {validationRows.map(
                        (row) => (

                          <tr
                            key={row.id}
                            className="border-b border-slate-100 last:border-b-0"
                          >

                            <td className="px-4 py-3">

                              <div>

                                <p className="text-xs font-bold text-slate-800">
                                  {row.station}
                                </p>

                                {row.code && (
                                  <p className="text-[9px] text-slate-400 mt-0.5">
                                    {row.code}
                                  </p>
                                )}

                              </div>

                            </td>



                            <td className="px-4 py-3">

                              <span className="text-xs font-semibold text-slate-700">
                                {row.predicted !==
                                null &&
                                row.predicted !==
                                undefined &&
                                row.predicted !==
                                ""
                                  ? String(
                                      row.predicted
                                    )
                                  : "—"}
                              </span>

                            </td>



                            <td className="px-4 py-3">

                              <span className="text-xs font-semibold text-slate-700">
                                {row.actual !==
                                null &&
                                row.actual !==
                                undefined &&
                                row.actual !==
                                ""
                                  ? String(
                                      row.actual
                                    )
                                  : "Pending"}
                              </span>

                            </td>



                            <td className="px-4 py-3">

                              {row.errorMinutes !==
                              null ? (

                                <span
                                  className={`text-xs font-bold ${
                                    Math.abs(
                                      row.errorMinutes
                                    ) <= 5
                                      ? "text-emerald-700"
                                      : "text-amber-700"
                                  }`}
                                >
                                  {row.errorMinutes >
                                  0
                                    ? "+"
                                    : ""}
                                  {row.errorMinutes}{" "}
                                  min
                                </span>

                              ) : (

                                <span className="text-xs text-slate-400">
                                  —
                                </span>

                              )}

                            </td>



                            <td className="px-4 py-3">

                              {row.validated ? (

                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[9px] font-bold">

                                  <CheckCircle2
                                    size={12}
                                  />

                                  Validated

                                </span>

                              ) : (

                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-500 text-[9px] font-bold">

                                  <Clock3
                                    size={12}
                                  />

                                  Pending

                                </span>

                              )}

                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              )}

            </div>



            <div className="mt-3 flex items-start gap-2">

              <ShieldCheck
                size={14}
                className="text-slate-400 mt-0.5 shrink-0"
              />

              <p className="text-[9px] text-slate-400 leading-relaxed">
                Validation compares the AI prediction with
                recorded actual arrival data. No validation
                result is generated when actual arrival data
                is unavailable.
              </p>

            </div>

          </div>

        </section>



        {/* =====================================================
            DEMO NOTE
            ===================================================== */}

        <div className="mt-4 px-1 pb-6">

          <p className="text-[10px] text-slate-400 text-center">
            Prototype controller interface — operational actions are simulated for demonstration.
          </p>

        </div>

      </main>

    </div>
  );
};

export default ControllerDashboard;