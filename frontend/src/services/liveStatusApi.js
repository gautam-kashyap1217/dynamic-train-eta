import { getMockLiveStatus } from "../data/mockLiveStatus";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8000/api/v1";

// ======================================================
// GENERIC HELPERS
// ======================================================

const toFiniteNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
};

const normalizeText = (value) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value)
    .trim()
    .toLowerCase();
};

// ======================================================
// DISTANCE HELPERS
//
// IMPORTANT:
//
// We NEVER use nextHalt.distance directly as the
// "distance from current train location".
//
// nextHalt.distance may represent cumulative distance
// from the source station.
//
// We calculate:
//
// Current train position -> Next station
// ======================================================

const haversineDistanceKm = (
  latitude1,
  longitude1,
  latitude2,
  longitude2
) => {
  const lat1 = toFiniteNumber(latitude1);
  const lon1 = toFiniteNumber(longitude1);
  const lat2 = toFiniteNumber(latitude2);
  const lon2 = toFiniteNumber(longitude2);

  if (
    lat1 === null ||
    lon1 === null ||
    lat2 === null ||
    lon2 === null
  ) {
    return null;
  }

  const earthRadiusKm = 6371;

  const lat1Radians =
    (lat1 * Math.PI) / 180;

  const lat2Radians =
    (lat2 * Math.PI) / 180;

  const deltaLatitude =
    ((lat2 - lat1) * Math.PI) / 180;

  const deltaLongitude =
    ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaLatitude / 2) *
      Math.sin(deltaLatitude / 2) +
    Math.cos(lat1Radians) *
      Math.cos(lat2Radians) *
      Math.sin(deltaLongitude / 2) *
      Math.sin(deltaLongitude / 2);

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return earthRadiusKm * c;
};

// ======================================================
// FIND ROUTE STATION
// ======================================================

const findRouteStation = (
  route,
  stationData
) => {
  if (
    !Array.isArray(route) ||
    !stationData
  ) {
    return null;
  }

  const stationName =
    normalizeText(
      stationData.stationName ??
        stationData.name ??
        stationData.station?.name
    );

  const stationCode =
    normalizeText(
      stationData.stationCode ??
        stationData.code ??
        stationData.station?.code
    );

  if (
    !stationName &&
    !stationCode
  ) {
    return null;
  }

  return (
    route.find((station) => {
      const routeName =
        normalizeText(
          station.name ??
            station.stationName ??
            station.station?.name
        );

      const routeCode =
        normalizeText(
          station.code ??
            station.stationCode ??
            station.station?.code
        );

      if (
        stationCode &&
        routeCode &&
        stationCode === routeCode
      ) {
        return true;
      }

      if (
        stationName &&
        routeName &&
        stationName === routeName
      ) {
        return true;
      }

      return false;
    }) || null
  );
};

// ======================================================
// FIND NEXT STOPPING STATION
// ======================================================

const findNextStationInRoute = (
  route,
  nextHalt,
  prediction
) => {
  if (!Array.isArray(route)) {
    return null;
  }

  const nextStationName =
    normalizeText(
      nextHalt?.stationName ??
        nextHalt?.name ??
        prediction?.nextStation ??
        prediction?.next_station
    );

  const nextStationCode =
    normalizeText(
      nextHalt?.stationCode ??
        nextHalt?.code
    );

  if (nextStationCode) {
    const byCode =
      route.find(
        (station) =>
          normalizeText(
            station.code ??
              station.stationCode
          ) === nextStationCode
      );

    if (byCode) {
      return byCode;
    }
  }

  if (nextStationName) {
    const byName =
      route.find(
        (station) =>
          normalizeText(
            station.name ??
              station.stationName
          ) === nextStationName
      );

    if (byName) {
      return byName;
    }
  }

  return null;
};

// ======================================================
// CURRENT LOCATION MATCH
// ======================================================

const findCurrentRoutePoint = (
  route,
  currentLocation
) => {
  if (
    !Array.isArray(route) ||
    !currentLocation
  ) {
    return null;
  }

  const currentName =
    normalizeText(
      currentLocation.stationName ??
        currentLocation.name
    );

  const currentCode =
    normalizeText(
      currentLocation.stationCode ??
        currentLocation.code
    );

  if (currentCode) {
    const byCode =
      route.find(
        (station) =>
          normalizeText(
            station.code ??
              station.stationCode
          ) === currentCode
      );

    if (byCode) {
      return byCode;
    }
  }

  if (currentName) {
    const byName =
      route.find(
        (station) =>
          normalizeText(
            station.name ??
              station.stationName
          ) === currentName
      );

    if (byName) {
      return byName;
    }
  }

  return null;
};

// ======================================================
// CALCULATE CURRENT -> NEXT DISTANCE
//
// Priority:
//
// 1. GPS coordinates
// 2. Route cumulative-distance difference
// 3. Explicit backend current-distance fields
// 4. null
//
// IMPORTANT:
// nextHalt.distance alone is NOT used.
// ======================================================

const calculateDistanceToNextStation = ({
  liveData,
  currentLocation,
  nextHalt,
  route,
  prediction,
}) => {
  // ----------------------------------------------------
  // 1. CURRENT GPS COORDINATES
  // ----------------------------------------------------

  const currentLatitude =
    currentLocation?.coordinates?.lat ??
    currentLocation?.latitude ??
    liveData?.latitude ??
    liveData?.currentLatitude;

  const currentLongitude =
    currentLocation?.coordinates?.lng ??
    currentLocation?.longitude ??
    liveData?.longitude ??
    liveData?.currentLongitude;

  // ----------------------------------------------------
  // Find the next station in the route.
  // ----------------------------------------------------

  const nextRouteStation =
    findNextStationInRoute(
      route,
      nextHalt,
      prediction
    );

  const nextLatitude =
    nextHalt?.coordinates?.lat ??
    nextHalt?.latitude ??
    nextHalt?.lat ??
    nextRouteStation?.coordinates?.lat ??
    nextRouteStation?.latitude ??
    nextRouteStation?.lat;

  const nextLongitude =
    nextHalt?.coordinates?.lng ??
    nextHalt?.longitude ??
    nextHalt?.lng ??
    nextRouteStation?.coordinates?.lng ??
    nextRouteStation?.longitude ??
    nextRouteStation?.lng;

  const gpsDistance =
    haversineDistanceKm(
      currentLatitude,
      currentLongitude,
      nextLatitude,
      nextLongitude
    );

  if (
    gpsDistance !== null &&
    gpsDistance >= 0
  ) {
    return gpsDistance;
  }

  // ----------------------------------------------------
  // 2. ROUTE DISTANCE DIFFERENCE
  //
  // Example:
  //
  // Current location = Birlanagar
  // Birlanagar route distance = 646 km
  //
  // Next station = Morena
  // Morena route distance = 712 km
  //
  // Distance to next = 712 - 646 = 66 km
  //
  // NOT 712 km.
  // ----------------------------------------------------

  const currentRoutePoint =
    findCurrentRoutePoint(
      route,
      currentLocation
    );

  const currentRouteDistance =
    toFiniteNumber(
      currentRoutePoint?.distance ??
        currentRoutePoint?.distanceKm ??
        currentRoutePoint?.distance_from_origin_km
    );

  const nextRouteDistance =
    toFiniteNumber(
      nextRouteStation?.distance ??
        nextRouteStation?.distanceKm ??
        nextRouteStation?.distance_from_origin_km
    );

  if (
    currentRouteDistance !== null &&
    nextRouteDistance !== null
  ) {
    const difference =
      nextRouteDistance -
      currentRouteDistance;

    if (difference >= 0) {
      return difference;
    }
  }

  // ----------------------------------------------------
  // 3. EXPLICIT BACKEND CURRENT -> NEXT DISTANCE
  //
  // Only use fields whose meaning explicitly indicates
  // distance from the current position to the next station.
  // ----------------------------------------------------

  const explicitDistance =
    toFiniteNumber(
      nextHalt?.distanceFromCurrent ??
        nextHalt?.distance_from_current ??
        nextHalt?.distanceToNextStation ??
        nextHalt?.distance_to_next_station ??
        nextHalt?.distanceFromCurrentLocation ??
        nextHalt?.distance_from_current_location ??
        liveData?.distanceFromNextStationKm ??
        liveData?.distance_from_next_station_km
    );

  if (
    explicitDistance !== null &&
    explicitDistance >= 0
  ) {
    return explicitDistance;
  }

  // ----------------------------------------------------
  // 4. NO SAFE DISTANCE AVAILABLE
  //
  // Deliberately return null instead of showing the
  // wrong cumulative source distance.
  // ----------------------------------------------------

  return null;
};

// ======================================================
// FORMAT DISTANCE
// ======================================================

const formatDistanceToNextStation = (
  distanceKm,
  nextStationName
) => {
  if (
    distanceKm === null ||
    distanceKm === undefined ||
    !Number.isFinite(
      Number(distanceKm)
    )
  ) {
    return "Distance unavailable";
  }

  const distance =
    Math.max(
      0,
      Number(distanceKm)
    );

  const formattedDistance =
    distance < 10
      ? distance.toFixed(2)
      : distance.toFixed(1);

  if (nextStationName) {
    return `${formattedDistance} km to ${nextStationName}`;
  }

  return `${formattedDistance} km`;
};

// ======================================================
// NORMALIZE ETA PREDICTION
// ======================================================

const normalizePrediction = (
  etaData
) => {
  if (!etaData) {
    return null;
  }

  return {
    etaMinutes:
      etaData.eta_minutes ??
      etaData.etaMinutes ??
      null,

    eta_minutes:
      etaData.eta_minutes ??
      etaData.etaMinutes ??
      null,

    p10:
      etaData.p10 ??
      null,

    p50:
      etaData.p50 ??
      null,

    p90:
      etaData.p90 ??
      null,

    canArriveEarlierBy:
      etaData.can_arrive_earlier_by ??
      etaData.canArriveEarlierBy ??
      null,

    can_arrive_earlier_by:
      etaData.can_arrive_earlier_by ??
      etaData.canArriveEarlierBy ??
      null,

    canBeDelayedBy:
      etaData.can_be_delayed_by ??
      etaData.canBeDelayedBy ??
      null,

    can_be_delayed_by:
      etaData.can_be_delayed_by ??
      etaData.canBeDelayedBy ??
      null,

    nextStation:
      etaData.next_station ??
      etaData.nextStation ??
      null,

    next_station:
      etaData.next_station ??
      etaData.nextStation ??
      null,

    speedKmph:
      etaData.speed_kmph ??
      etaData.speedKmph ??
      null,

    speed_kmph:
      etaData.speed_kmph ??
      etaData.speedKmph ??
      null,

    scheduledArrival:
      etaData.scheduled_arrival ??
      etaData.scheduledArrival ??
      null,

    scheduled_arrival:
      etaData.scheduled_arrival ??
      etaData.scheduledArrival ??
      null,

    predictedArrival:
      etaData.predicted_arrival ??
      etaData.predictedArrival ??
      null,

    predicted_arrival:
      etaData.predicted_arrival ??
      etaData.predictedArrival ??
      null,

    scheduledEta:
      etaData.scheduled_eta ??
      etaData.scheduledEta ??
      null,

    predictedEta:
      etaData.predicted_eta ??
      etaData.predictedEta ??
      null,

    confidence:
      etaData.confidence ??
      etaData.confidence_score ??
      etaData.confidenceScore ??
      null,

    confidence_score:
      etaData.confidence_score ??
      etaData.confidenceScore ??
      etaData.confidence ??
      null,

    confidenceScore:
      etaData.confidenceScore ??
      etaData.confidence_score ??
      etaData.confidence ??
      null,

    confidence_level:
      etaData.confidence_level ??
      etaData.confidenceLevel ??
      null,

    confidenceLevel:
      etaData.confidenceLevel ??
      etaData.confidence_level ??
      null,

    confidence_reason:
      etaData.confidence_reason ??
      etaData.confidenceReason ??
      null,

    confidenceReason:
      etaData.confidenceReason ??
      etaData.confidence_reason ??
      null,

    predictionAccuracy:
      etaData.prediction_accuracy ??
      etaData.predictionAccuracy ??
      null,

    prediction_accuracy:
      etaData.prediction_accuracy ??
      etaData.predictionAccuracy ??
      null,
  };
};

// ======================================================
// NORMALIZE STATIONS
// ======================================================

const normalizeStations = (
  stations
) => {
  if (!Array.isArray(stations)) {
    return [];
  }

  return stations.map(
    (station) => ({
      ...station,

      name:
        station.name ??
        station.stationName ??
        station.station?.name ??
        "Unknown Station",

      code:
        station.code ??
        station.stationCode ??
        station.station?.code ??
        "",

      distance:
        station.distance ??
        station.distanceKm ??
        station.distance_from_origin_km ??
        undefined,

      isHalt:
        station.isHalt ??
        station.haltFlag ??
        undefined,

      confidence:
        station.confidence ??
        station.predictionConfidence ??
        null,

      confidenceLevel:
        station.confidenceLevel ??
        station.predictionConfidenceLevel ??
        null,

      confidenceReason:
        station.confidenceReason ??
        station.predictionConfidenceReason ??
        null,
    })
  );
};

// ======================================================
// NORMALIZE LIVE RESPONSE
// ======================================================

const normalizeLiveResponse = (
  liveData,
  prediction = null
) => {
  const trainInfo =
    liveData?.train ??
    {};

  const source =
    trainInfo.source ??
    liveData?.source ??
    {};

  const destination =
    trainInfo.destination ??
    liveData?.destination ??
    {};

  const currentLocation =
    liveData?.currentLocation ??
    {};

  const nextHalt =
    liveData?.nextHalt ??
    {};

  const route =
    normalizeStations(
      liveData?.route ??
        liveData?.stations ??
        []
    );

  // ----------------------------------------------------
  // SPEED
  // ----------------------------------------------------

  const speed =
    Number(
      currentLocation.speedKmph ??
        currentLocation.speedKmh ??
        currentLocation.speed ??
        liveData?.speedKmph ??
        liveData?.speedKmh
    );

  const displayedSpeed =
    Number.isFinite(speed)
      ? speed
      : 50;

  // ----------------------------------------------------
  // DELAY
  // ----------------------------------------------------

  const currentDelay =
    Number(
      liveData?.delayMinutes ??
        currentLocation.delayMinutes ??
        0
    );

  // ----------------------------------------------------
  // CURRENT LOCATION NAME
  // ----------------------------------------------------

  const currentLocationName =
    currentLocation.stationName ??
    currentLocation.name ??
    "Live location unavailable";

  // ----------------------------------------------------
  // NEXT STATION NAME
  // ----------------------------------------------------

  const nextStationName =
    nextHalt.stationName ??
    nextHalt.name ??
    prediction?.nextStation ??
    prediction?.next_station ??
    "See timetable below";

  // ----------------------------------------------------
  // CALCULATE DISTANCE
  //
  // This is the important fix.
  // ----------------------------------------------------

  const distanceToNextStation =
    calculateDistanceToNextStation({
      liveData,
      currentLocation,
      nextHalt,
      route,
      prediction,
    });

  const formattedDistance =
    formatDistanceToNextStation(
      distanceToNextStation,
      nextStationName
    );

  // ----------------------------------------------------
  // RETURN NORMALIZED RESPONSE
  // ----------------------------------------------------

  return {
    success: true,

    completed:
      liveData?.status === "completed" ||
      liveData?.status === "terminated" ||
      currentLocation.status === "completed",

    timetableMode: false,

    notStarted: false,

    train: {
      ...trainInfo,

      number:
        liveData?.trainNumber ??
        trainInfo.number ??
        trainInfo.trainNumber ??
        "Train",

      trainNumber:
        liveData?.trainNumber ??
        trainInfo.number ??
        trainInfo.trainNumber ??
        "Train",

      name:
        liveData?.trainName ??
        trainInfo.name ??
        trainInfo.trainName ??
        "Train",

      trainName:
        liveData?.trainName ??
        trainInfo.name ??
        trainInfo.trainName ??
        "Train",

      from:
        source.name ??
        trainInfo.from ??
        "Origin",

      to:
        destination.name ??
        trainInfo.to ??
        "Destination",
    },

    // ==================================================
    // LIVE
    // ==================================================

    live: {
      currentLocation:
        currentLocationName,

      nextStation:
        nextStationName,

      distanceFromNextStation:
        formattedDistance,

      speed:
        displayedSpeed,

      delay:
        currentDelay,

      lastUpdated:
        liveData?.lastUpdatedAt
          ? new Date(
              liveData.lastUpdatedAt
            ).toLocaleTimeString()
          : "Unavailable",

      etaUpdated:
        liveData?.lastUpdatedAt
          ? new Date(
              liveData.lastUpdatedAt
            ).toLocaleTimeString()
          : "Unavailable",

      latitude:
        currentLocation.coordinates?.lat ??
        currentLocation.latitude ??
        source.lat ??
        0,

      longitude:
        currentLocation.coordinates?.lng ??
        currentLocation.longitude ??
        source.lng ??
        0,
    },

    stations:
      route,

    delayReason:
      liveData?.delayReason ??
      null,

    weather:
      liveData?.weather ??
      null,

    prediction:
      prediction,
  };
};

// ======================================================
// MAIN FUNCTION
// ======================================================

export const getLiveTrainStatus = async (
  trainNumber
) => {
  let liveData = null;

  let prediction = null;

  // ====================================================
  // 1. LIVE TRAIN STATUS
  // ====================================================

  try {
    const liveResponse =
      await fetch(
        `${API_BASE_URL}/trains/${trainNumber}/live-status`
      );

    if (
      liveResponse.ok
    ) {
      const result =
        await liveResponse.json();

      liveData =
        result?.data ??
        result;
    } else {
      console.warn(
        `Live status returned ${liveResponse.status}.`
      );
    }
  } catch (error) {
    console.warn(
      "Live status request failed:",
      error
    );
  }

  // ====================================================
  // 2. ETA PREDICTION
  // ====================================================

  if (liveData) {
    try {
      const etaResponse =
        await fetch(
          `${API_BASE_URL}/train/${trainNumber}/eta`
        );

      if (
        etaResponse.ok
      ) {
        const etaData =
          await etaResponse.json();

        prediction =
          normalizePrediction(
            etaData?.data ??
            etaData
          );
      } else {
        console.warn(
          `ETA prediction returned ${etaResponse.status}.`
        );
      }
    } catch (error) {
      console.warn(
        "ETA prediction unavailable:",
        error
      );
    }
  }

  // ====================================================
  // 3. REAL DATA SUCCESS
  // ====================================================

  if (liveData) {
    return normalizeLiveResponse(
      liveData,
      prediction
    );
  }

  // ====================================================
  // 4. PROTOTYPE FALLBACK
  //
  // IMPORTANT:
  //
  // Do NOT use the default mockLiveStatus here.
  // The default export was mock12002, which caused
  // every failed request to display train 12002.
  //
  // getMockLiveStatus(trainNumber) selects the correct
  // mock data for the requested train number.
  // ====================================================

  console.warn(
    `Using prototype mock live-status data for train ${trainNumber}.`
  );

  const fallbackMock =
    getMockLiveStatus(trainNumber);

  // ----------------------------------------------------
  // Unsupported train number
  // ----------------------------------------------------

  if (!fallbackMock) {
    throw new Error(
      `No live-status data is available for train ${trainNumber}.`
    );
  }

  // ----------------------------------------------------
  // Return the requested train's mock data
  // ----------------------------------------------------

  return {
    ...fallbackMock,

    train: {
      ...(fallbackMock.train || {}),

      number:
        fallbackMock.train?.number ??
        fallbackMock.train?.trainNumber ??
        trainNumber,

      trainNumber:
        fallbackMock.train?.trainNumber ??
        fallbackMock.train?.number ??
        trainNumber,
    },

    stations:
      normalizeStations(
        fallbackMock.stations
      ),

    prediction:
      fallbackMock.prediction
        ? {
            ...fallbackMock.prediction,
          }
        : null,
  };
};

export default getLiveTrainStatus;