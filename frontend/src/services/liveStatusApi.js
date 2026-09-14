const API_BASE_URL = "http://localhost:8000/api/v1";

export const getLiveTrainStatus = async (trainNumber) => {
  let liveData = null;
  let timetableData = null;
  let prediction = null;

  // --------------------------------------------------
  // 1. Try to fetch live train status
  // --------------------------------------------------
  try {
    const liveResponse = await fetch(
      `${API_BASE_URL}/trains/${trainNumber}/live-status`
    );

    if (liveResponse.ok) {
      const result = await liveResponse.json();
      liveData = result.data ?? result;
    }
  } catch (error) {
    console.warn("Live status unavailable. Trying timetable fallback...");
  }

  // --------------------------------------------------
  // 2. Extract live-data fields
  // --------------------------------------------------
  const liveTrainInfo = liveData?.train ?? {};
  const liveRoute = liveData?.route ?? [];
  const liveCurrentLocation = liveData?.currentLocation ?? {};
  const liveFirstStation = liveRoute[0] ?? {};

  const liveSpeed = Number(
    liveCurrentLocation.speedKmph ??
      liveCurrentLocation.speedKmh ??
      liveCurrentLocation.speed ??
      liveData?.speedKmph ??
      liveData?.speedKmh
  );

  const liveDistanceFromOrigin = Number(
    liveCurrentLocation.distanceFromOriginKm ?? 0
  );

  // --------------------------------------------------
  // 3. Detect whether the train has not started
  // --------------------------------------------------
  const trainNotStarted =
    Boolean(liveData) &&
    liveFirstStation.status === "upcoming" &&
    liveDistanceFromOrigin === 0 &&
    liveSpeed === 0;

  // --------------------------------------------------
  // 4. Fetch ETA prediction only after train starts
  // --------------------------------------------------
  if (liveData && !trainNotStarted) {
    try {
      const etaResponse = await fetch(
        `${API_BASE_URL}/train/${trainNumber}/eta`
      );

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
    } catch (error) {
      console.warn("ETA prediction unavailable.");
    }
  }

  // --------------------------------------------------
  // 5. Fetch timetable if live status is unavailable
  // --------------------------------------------------
  if (!liveData) {
    const timetableResponse = await fetch(
      `${API_BASE_URL}/trains/${trainNumber}/details`
    );

    if (!timetableResponse.ok) {
      throw new Error("Unable to fetch live status or timetable");
    }

    const timetableResult = await timetableResponse.json();
    timetableData = timetableResult.data ?? timetableResult;
  }

  // Prefer live data; otherwise use timetable data
  const data = liveData ?? timetableData;

  const trainInfo = data?.train ?? {};
  const source = trainInfo.source ?? {};
  const destination = trainInfo.destination ?? {};

  const route = data?.route ?? [];
  const currentLocation = data?.currentLocation ?? {};
  const nextHalt = data?.nextHalt ?? {};

  const isCompleted =
    data?.status === "completed" ||
    data?.status === "terminated" ||
    currentLocation.status === "completed";

  // --------------------------------------------------
  // 6. Handle train that has not started
  // --------------------------------------------------
  if (trainNotStarted) {
    const scheduledDeparture =
      liveFirstStation.scheduledDeparture ??
      liveFirstStation.departure ??
      "Scheduled departure unavailable";

    return {
      success: true,
      completed: false,
      timetableMode: true,
      notStarted: true,

      train: {
        number: data.trainNumber ?? trainInfo.number ?? trainNumber,
        name: data.trainName ?? trainInfo.name ?? "Train",
        from: source.name ?? "Origin",
        to: destination.name ?? "Destination",
      },

      live: {
        currentLocation:
          currentLocation.stationName ?? source.name ?? "Origin station",

        nextStation: "Train has not started yet",

        distanceFromNextStation: `Scheduled departure: ${scheduledDeparture}`,

        speed: 50,

        delay:
          data.delayMinutes ??
          currentLocation.delayMinutes ??
          0,

        lastUpdated: "Train not started",
        etaUpdated: "ETA prediction not started",

        latitude:
          currentLocation.coordinates?.lat ??
          source.lat ??
          0,

        longitude:
          currentLocation.coordinates?.lng ??
          source.lng ??
          0,
      },

      stations: route,
      delayReason: null,
      weather: null,
      prediction: null,
    };
  }

  // --------------------------------------------------
  // 7. Use actual live speed, or 50 km/h prototype fallback
  // --------------------------------------------------
  const actualLiveSpeed = Number(
    currentLocation.speedKmph ??
      currentLocation.speedKmh ??
      currentLocation.speed ??
      data?.speedKmph ??
      data?.speedKmh
  );

  const displayedSpeed = Number.isFinite(actualLiveSpeed)
    ? actualLiveSpeed
    : 50;

  // --------------------------------------------------
  // 8. Calculate distance from next station
  // --------------------------------------------------
  const nextHaltDistance = Number(nextHalt.distance);

  const currentDistanceFromOrigin = Number(
    currentLocation.distanceFromOriginKm
  );

  let distanceFromNextStation = "Distance unavailable";

  if (
    Number.isFinite(nextHaltDistance) &&
    Number.isFinite(currentDistanceFromOrigin)
  ) {
    const remainingDistance = Math.max(
      nextHaltDistance - currentDistanceFromOrigin,
      0
    );

    distanceFromNextStation = `${remainingDistance.toFixed(
      2
    )} km to ${nextHalt.stationName ?? "next station"}`;
  }

  if (!liveData) {
    distanceFromNextStation = "Timetable mode";
  }

  if (isCompleted) {
    distanceFromNextStation = "Train has reached its destination";
  }

  // --------------------------------------------------
  // 9. Return final response
  // --------------------------------------------------
  return {
    success: true,
    completed: isCompleted,
    timetableMode: !liveData,
    notStarted: false,

    train: {
      number: data.trainNumber ?? trainInfo.number ?? trainNumber,
      name: data.trainName ?? trainInfo.name ?? "Train",
      from: source.name ?? "Origin",
      to: destination.name ?? "Destination",
    },

    live: {
      currentLocation: isCompleted
        ? destination.name ?? "Destination"
        : currentLocation.stationName ?? "Live location unavailable",

      nextStation:
        nextHalt.stationName ??
        prediction?.nextStation ??
        "See timetable below",

      distanceFromNextStation,

      // Actual speed if available; otherwise prototype fallback
      speed: displayedSpeed,

      delay:
        data.delayMinutes ??
        currentLocation.delayMinutes ??
        0,

      lastUpdated: data.lastUpdatedAt
        ? new Date(data.lastUpdatedAt).toLocaleTimeString()
        : "Unavailable",

      etaUpdated: data.lastUpdatedAt
        ? new Date(data.lastUpdatedAt).toLocaleTimeString()
        : "Unavailable",

      latitude:
        currentLocation.coordinates?.lat ??
        source.lat ??
        0,

      longitude:
        currentLocation.coordinates?.lng ??
        source.lng ??
        0,
    },

    stations: route,

    delayReason: null,
    weather: null,
    prediction,
  };
};