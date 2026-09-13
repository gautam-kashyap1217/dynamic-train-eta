
const API_BASE_URL = "http://localhost:8000/api/v1";

export const getLiveTrainStatus = async (trainNumber) => {
  // ---------------------------------------------------------
  // 1. Fetch live train status
  // ---------------------------------------------------------

  const liveResponse = await fetch(
    `${API_BASE_URL}/trains/${trainNumber}/live-status`
  );

  if (!liveResponse.ok) {
    throw new Error("Failed to fetch live train status");
  }

  const result = await liveResponse.json();
  const data = result.data ?? result;

  // ---------------------------------------------------------
  // 2. Fetch ML-based ETA prediction
  // ---------------------------------------------------------

  const etaResponse = await fetch(
    `${API_BASE_URL}/train/${trainNumber}/eta`
  );

  let prediction = null;

  if (etaResponse.ok) {
    const etaData = await etaResponse.json();

    prediction = {
      etaMinutes: etaData.eta_minutes,
      p10: etaData.p10,
      p50: etaData.p50,
      p90: etaData.p90,
      canArriveEarlierBy: etaData.can_arrive_earlier_by,
      canBeDelayedBy: etaData.can_be_delayed_by,
      nextStation: etaData.next_station,
      predictedArrival: etaData.predicted_arrival,
      speedKmph: etaData.speed_kmph,
    };
  }

  // ---------------------------------------------------------
  // 3. Check whether the train has completed its journey
  // ---------------------------------------------------------

  const isCompleted =
    data.status === "completed" ||
    data.status === "terminated" ||
    data.currentLocation?.status === "completed";

  // ---------------------------------------------------------
  // 4. Extract train information
  // ---------------------------------------------------------

  const trainInfo = data.train ?? {};

  const source = trainInfo.source ?? {};
  const destination = trainInfo.destination ?? {};
  const currentLocation = data.currentLocation ?? {};
  const nextHalt = data.nextHalt ?? {};

  // ---------------------------------------------------------
  // 5. Determine speed
  // ---------------------------------------------------------

  const actualLiveSpeed = currentLocation.speedKmph;

  const estimatedSpeed =
    actualLiveSpeed !== null &&
    actualLiveSpeed !== undefined
      ? actualLiveSpeed
      : prediction?.speedKmph ?? 0;

  // ---------------------------------------------------------
  // 6. Calculate remaining distance to the next station
  // ---------------------------------------------------------

  const nextHaltDistance = Number(nextHalt.distance);
  const currentDistanceFromOrigin = Number(
    currentLocation.distanceFromOriginKm
  );

  let distanceFromNextStation = "Next station unavailable";

  if (
    Number.isFinite(nextHaltDistance) &&
    Number.isFinite(currentDistanceFromOrigin)
  ) {
    const remainingDistance = Math.max(
      nextHaltDistance - currentDistanceFromOrigin,
      0
    );

    distanceFromNextStation =
      `${remainingDistance.toFixed(2)} km to ${
        nextHalt.stationName ?? "next station"
      }`;
  }

  if (isCompleted) {
    distanceFromNextStation =
      "Train has reached its destination";
  }

  // ---------------------------------------------------------
  // 7. Return formatted data for the frontend
  // ---------------------------------------------------------

  return {
    success: true,
    completed: isCompleted,

    train: {
      number: data.trainNumber ?? trainNumber,
      name: data.trainName ?? trainInfo.name ?? "Train",
      from: source.name ?? "Origin",
      to: destination.name ?? "Destination",
    },

    live: {
      currentLocation: isCompleted
        ? destination.name ?? "Destination"
        : currentLocation.stationName ?? "Unknown",

      nextStation:
        nextHalt.stationName ??
        prediction?.nextStation ??
        "Unavailable",

      distanceFromNextStation,

      speed: estimatedSpeed,

      delay: data.delayMinutes ?? 0,

      lastUpdated: data.lastUpdatedAt
        ? new Date(data.lastUpdatedAt).toLocaleTimeString()
        : "Unavailable",

      etaUpdated: data.lastUpdatedAt
        ? new Date(data.lastUpdatedAt).toLocaleTimeString()
        : "Unavailable",

      latitude:
        currentLocation.coordinates?.lat ??
        destination.lat ??
        0,

      longitude:
        currentLocation.coordinates?.lng ??
        destination.lng ??
        0,
    },

    stations: data.route ?? [],

    delayReason: null,

    weather: null,

    prediction,
  };
};