const mock12002 = {
  success: true,

  completed: false,

  timetableMode: false,

  notStarted: false,

  // ==================================================
  // TRAIN
  // ==================================================

  train: {
    number: "12002",
    name: "New Delhi - Rani Kamlapati Shatabdi Express",
    trainNumber: "12002",
    trainName: "New Delhi - Rani Kamlapati Shatabdi Express",
    type: "Shatabdi Express",

    from: "New Delhi",
    to: "Rani Kamlapati",

    source: {
      name: "New Delhi",
      code: "NDLS",
      lat: 28.6431,
      lng: 77.2197,
    },

    destination: {
      name: "Rani Kamlapati",
      code: "RKMP",
    },

    status: "Running",
  },

  // ==================================================
  // LIVE TRAIN INFORMATION
  // ==================================================

  live: {
    currentLocation: "Dailwara",

    nextStation: "Lalitpur",

    // Distance from CURRENT LOCATION to NEXT STATION.
    // Dailwara ≈ 465 km from source.
    // Lalitpur ≈ 472.2 km from source.
    // Remaining distance ≈ 7.2 km.
    distanceFromNextStation: "7.2 km to Lalitpur",

    latitude: 24.6901,

    longitude: 78.4129,

    speed: 50,

    delay: 17,

    lastUpdated: "11:55:55 AM",

    etaUpdated: "11:55:55 AM",
  },

  // ==================================================
  // ROUTE / STATIONS
  // ==================================================

  stations: [
    {
      name: "New Delhi",
      code: "NDLS",
      distance: 0,
      isHalt: true,
      status: "completed",

      arrival: {
        actual: "--",
        predicted: "--",
      },

      departure: {
        actual: "06:00 AM",
        predicted: "06:00 AM",
      },

      confidence: 96,
      confidenceLevel: "High",

      confidenceReason:
        "High confidence because the train has completed the origin station.",
    },

    {
      name: "Agra Cantt",
      code: "AGC",
      distance: 195,
      isHalt: true,
      status: "completed",

      arrival: {
        actual: "07:45 AM",
        predicted: "07:42 AM",
      },

      departure: {
        actual: "07:50 AM",
        predicted: "07:47 AM",
        delay: -3,
      },

      confidence: 92,
      confidenceLevel: "High",

      confidenceReason:
        "Prediction uncertainty is relatively low for this completed route segment.",

      halt: "5m",
    },

    {
      name: "Gwalior",
      code: "GWL",
      distance: 315,
      isHalt: true,
      status: "completed",

      arrival: {
        actual: "09:10 AM",
        predicted: "09:14 AM",
      },

      departure: {
        actual: "09:15 AM",
        predicted: "09:19 AM",
        delay: 4,
      },

      confidence: 90,
      confidenceLevel: "High",

      confidenceReason:
        "The completed segment provides a relatively stable prediction reference.",

      halt: "5m",
    },

    {
      name: "Route Point 1",
      code: "RP01",
      distance: 340,
      isHalt: false,
      status: "completed",

      arrival: {
        actual: null,
        predicted: "09:35 AM",
      },

      departure: {
        actual: null,
        predicted: "09:35 AM",
      },
    },

    {
      name: "Jhansi Jn",
      code: "JHS",
      distance: 410,
      isHalt: true,
      status: "completed",

      arrival: {
        actual: "10:20 AM",
        predicted: "10:25 AM",
      },

      departure: {
        actual: "10:25 AM",
        predicted: "10:30 AM",
        delay: 5,
      },

      confidence: 87,
      confidenceLevel: "High",

      confidenceReason:
        "Recent route information provides relatively stable ETA estimation.",

      halt: "5m",
    },

    {
      name: "Route Point 2",
      code: "RP02",
      distance: 445,
      isHalt: false,
      status: "completed",

      arrival: {
        actual: null,
        predicted: "10:52 AM",
      },

      departure: {
        actual: null,
        predicted: "10:52 AM",
      },
    },

    {
      name: "Dailwara",
      code: "DWA",
      distance: 465,
      isHalt: false,
      status: "current",
      isCurrent: true,

      arrival: {
        actual: null,
        predicted: "11:35 AM",
      },

      departure: {
        actual: null,
        predicted: "11:35 AM",
      },
    },

    {
      name: "Route Point 3",
      code: "RP03",
      distance: 470,
      isHalt: false,
      status: "upcoming",

      arrival: {
        actual: null,
        predicted: "11:43 AM",
      },

      departure: {
        actual: null,
        predicted: "11:43 AM",
      },
    },

    {
      name: "Lalitpur",
      code: "LAR",
      distance: 472.2,
      isHalt: true,
      status: "upcoming",

      arrival: {
        actual: null,
        predicted: "12:08 PM",
      },

      departure: {
        actual: null,
        predicted: "12:13 PM",
      },

      confidence: 78,
      confidenceLevel: "Moderate",

      confidenceReason:
        "Current next-station ETA has moderate uncertainty based on the prediction interval.",

      halt: "5m",
    },

    {
      name: "Bina Jn",
      code: "BINA",
      distance: 555,
      isHalt: true,
      status: "upcoming",

      arrival: {
        actual: null,
        predicted: "01:15 PM",
      },

      departure: {
        actual: null,
        predicted: "01:20 PM",
      },

      confidence: 75,
      confidenceLevel: "Moderate",

      confidenceReason:
        "Longer forecast horizon results in wider prediction uncertainty.",

      halt: "5m",
    },

    {
      name: "Rani Kamlapati",
      code: "RKMP",
      distance: 700,
      isHalt: true,
      status: "upcoming",

      arrival: {
        actual: null,
        predicted: "03:05 PM",
      },

      departure: {
        actual: null,
        predicted: "--",
      },

      confidence: 69,
      confidenceLevel: "Moderate",

      confidenceReason:
        "Longer forecast horizon increases prediction uncertainty.",

      halt: "Terminal",
    },
  ],

  // ==================================================
  // DELAY REASON
  // ==================================================

  delayReason: {
    type: "Operational Delay",

    description:
      "Current delay is associated with operational conditions and section congestion.",

    delay: 17,
  },

  // ==================================================
  // PREDICTION
  // ==================================================

  prediction: {
    etaMinutes: 51,
    eta_minutes: 51,

    p10: 35,
    p50: 51,
    p90: 80,

    canArriveEarlierBy: 16,
    can_arrive_earlier_by: 16,

    canBeDelayedBy: 29,
    can_be_delayed_by: 29,

    nextStation: "Lalitpur",
    next_station: "Lalitpur",

    speedKmph: 50,
    speed_kmph: 50,

    scheduledArrival: "11:51 AM",
    scheduled_arrival: "11:51 AM",

    predictedArrival: "12:08 PM",
    predicted_arrival: "12:08 PM",

    scheduledEta: "11:51 AM",
    predictedEta: "12:08 PM",

    confidence: 78,
    confidence_score: 78,
    confidenceScore: 78,

    confidence_level: "Moderate",
    confidenceLevel: "Moderate",

    confidence_reason:
      "Moderate confidence based on the uncertainty range of the ensemble ETA prediction.",

    confidenceReason:
      "Moderate confidence based on the uncertainty range of the ensemble ETA prediction.",

    predictionAccuracy: null,
    prediction_accuracy: null,
  },

  // ==================================================
  // WEATHER
  // ==================================================

  weather: {
    location: "Lalitpur",

    condition: "Overcast",

    temperature_c: 28,

    rainfall_mm: 0,

    wind_speed_kmph: 6.6,

    visibility_km: 10,

    humidity_percent: 82,

    impact: "+0-3 min",
  },
};


// ======================================================
// 12919 - MALWA EXPRESS
// ======================================================

const mock12919 = {
  success: true,

  completed: false,

  timetableMode: false,

  notStarted: false,

  train: {
    number: "12919",
    name: "Malwa Express",
    trainNumber: "12919",
    trainName: "Malwa Express",
    type: "Superfast Express",

    from: "Dr. Ambedkar Nagar",
    to: "Shri Mata Vaishno Devi Katra",

    source: {
      name: "Dr. Ambedkar Nagar",
      code: "DADN",
      lat: 22.6534,
      lng: 75.8107,
    },

    destination: {
      name: "Shri Mata Vaishno Devi Katra",
      code: "SVDK",
    },

    status: "Running",
  },

  // ==================================================
  // LIVE TRAIN INFORMATION
  // ==================================================

  live: {
    currentLocation: "Ratlam",

    nextStation: "Nagda Jn",

    // Ratlam = 175 km from source.
    // Nagda Jn = 210 km from source.
    // Current-to-next distance = 210 - 175 = 35 km.
    distanceFromNextStation: "35 km to Nagda Jn",

    latitude: 23.3301,

    longitude: 75.0368,

    speed: 64,

    delay: 9,

    lastUpdated: "12:02:18 PM",

    etaUpdated: "12:02:18 PM",
  },

  // ==================================================
  // ROUTE / STATIONS
  // ==================================================

  stations: [
    {
      name: "Dr. Ambedkar Nagar",
      code: "DADN",
      distance: 0,
      isHalt: true,
      status: "completed",

      arrival: {
        actual: "--",
        predicted: "--",
      },

      departure: {
        actual: "11:00 AM",
        predicted: "11:00 AM",
      },

      confidence: 96,
      confidenceLevel: "High",

      confidenceReason:
        "High confidence because the train has completed the origin station.",
    },

    {
      name: "Indore Jn",
      code: "INDB",
      distance: 25,
      isHalt: true,
      status: "completed",

      arrival: {
        actual: "11:25 AM",
        predicted: "11:28 AM",
      },

      departure: {
        actual: "11:30 AM",
        predicted: "11:33 AM",
        delay: 3,
      },

      confidence: 92,
      confidenceLevel: "High",

      confidenceReason:
        "Recent completed-station information provides a stable reference.",

      halt: "5m",
    },

    {
      name: "Dewas",
      code: "DWX",
      distance: 70,
      isHalt: true,
      status: "completed",

      arrival: {
        actual: "12:00 PM",
        predicted: "12:03 PM",
      },

      departure: {
        actual: "12:03 PM",
        predicted: "12:06 PM",
        delay: 3,
      },

      confidence: 89,
      confidenceLevel: "High",

      confidenceReason:
        "Completed route data provides relatively low uncertainty.",

      halt: "3m",
    },

    {
      name: "Route Point M1",
      code: "M001",
      distance: 92,
      isHalt: false,
      status: "completed",

      arrival: {
        actual: null,
        predicted: "12:18 PM",
      },

      departure: {
        actual: null,
        predicted: "12:18 PM",
      },
    },

    {
      name: "Ujjain Jn",
      code: "UJN",
      distance: 110,
      isHalt: true,
      status: "completed",

      arrival: {
        actual: "12:30 PM",
        predicted: "12:34 PM",
      },

      departure: {
        actual: "12:35 PM",
        predicted: "12:39 PM",
        delay: 4,
      },

      confidence: 88,
      confidenceLevel: "High",

      confidenceReason:
        "Recent route observations provide relatively stable prediction confidence.",

      halt: "5m",
    },

    {
      name: "Route Point M2",
      code: "M002",
      distance: 135,
      isHalt: false,
      status: "completed",

      arrival: {
        actual: null,
        predicted: "12:57 PM",
      },

      departure: {
        actual: null,
        predicted: "12:57 PM",
      },
    },

    {
      name: "Ratlam",
      code: "RTM",
      distance: 175,
      isHalt: true,
      status: "current",
      isCurrent: true,

      arrival: {
        actual: "01:35 PM",
        predicted: "01:32 PM",
      },

      departure: {
        actual: null,
        predicted: "01:40 PM",
      },

      confidence: 84,
      confidenceLevel: "High",

      confidenceReason:
        "Current train position provides a relatively short prediction horizon.",

      halt: "5m",
    },

    {
      name: "Route Point M3",
      code: "M003",
      distance: 194,
      isHalt: false,
      status: "upcoming",

      arrival: {
        actual: null,
        predicted: "01:58 PM",
      },

      departure: {
        actual: null,
        predicted: "01:58 PM",
      },
    },

    {
      name: "Nagda Jn",
      code: "NAD",
      distance: 210,
      isHalt: true,
      status: "upcoming",

      arrival: {
        actual: null,
        predicted: "02:18 PM",
      },

      departure: {
        actual: null,
        predicted: "02:23 PM",
      },

      confidence: 79,
      confidenceLevel: "Moderate",

      confidenceReason:
        "Moderate confidence due to uncertainty in the upcoming route segment.",

      halt: "5m",
    },

    {
      name: "Kota Jn",
      code: "KOTA",
      distance: 430,
      isHalt: true,
      status: "upcoming",

      arrival: {
        actual: null,
        predicted: "05:15 PM",
      },

      departure: {
        actual: null,
        predicted: "05:20 PM",
      },

      confidence: 73,
      confidenceLevel: "Moderate",

      confidenceReason:
        "Longer prediction horizon produces wider uncertainty.",

      halt: "5m",
    },

    {
      name: "New Delhi",
      code: "NDLS",
      distance: 700,
      isHalt: true,
      status: "upcoming",

      arrival: {
        actual: null,
        predicted: "09:00 PM",
      },

      departure: {
        actual: null,
        predicted: "--",
      },

      confidence: 67,
      confidenceLevel: "Moderate",

      confidenceReason:
        "Longer forecast horizon results in greater ETA uncertainty.",

      halt: "Terminal",
    },
  ],

  // ==================================================
  // DELAY REASON
  // ==================================================

  delayReason: {
    type: "Section Congestion",

    description:
      "A moderate delay is being simulated due to congestion on the current route section.",

    delay: 9,
  },

  // ==================================================
  // PREDICTION
  // ==================================================

  prediction: {
    etaMinutes: 29,
    eta_minutes: 29,

    p10: 20,
    p50: 29,
    p90: 45,

    canArriveEarlierBy: 9,
    can_arrive_earlier_by: 9,

    canBeDelayedBy: 16,
    can_be_delayed_by: 16,

    nextStation: "Nagda Jn",
    next_station: "Nagda Jn",

    speedKmph: 64,
    speed_kmph: 64,

    scheduledArrival: "02:09 PM",
    scheduled_arrival: "02:09 PM",

    predictedArrival: "02:18 PM",
    predicted_arrival: "02:18 PM",

    scheduledEta: "02:09 PM",
    predictedEta: "02:18 PM",

    confidence: 79,
    confidence_score: 79,
    confidenceScore: 79,

    confidence_level: "Moderate",
    confidenceLevel: "Moderate",

    confidence_reason:
      "Moderate confidence based on the uncertainty range of the ensemble ETA prediction.",

    confidenceReason:
      "Moderate confidence based on the uncertainty range of the ensemble ETA prediction.",

    predictionAccuracy: null,
    prediction_accuracy: null,
  },

  // ==================================================
  // WEATHER
  // ==================================================

  weather: {
    location: "Nagda",

    condition: "Partly Cloudy",

    temperature_c: 30,

    rainfall_mm: 0,

    wind_speed_kmph: 8.2,

    visibility_km: 9,

    humidity_percent: 68,

    impact: "+0-2 min",
  },
};


// ======================================================
// 12952 - MUMBAI RAJDHANI
// ======================================================

const mock12952 = {
  success: true,

  completed: false,

  timetableMode: false,

  notStarted: false,

  train: {
    number: "12952",
    name: "Mumbai Central - New Delhi Rajdhani Express",
    trainNumber: "12952",
    trainName: "Mumbai Central - New Delhi Rajdhani Express",
    type: "Rajdhani Express",

    from: "Mumbai Central",
    to: "New Delhi",

    source: {
      name: "Mumbai Central",
      code: "MMCT",
      lat: 18.9696,
      lng: 72.8194,
    },

    destination: {
      name: "New Delhi",
      code: "NDLS",
    },

    status: "Running",
  },

  // ==================================================
  // LIVE TRAIN INFORMATION
  // ==================================================

  live: {
    currentLocation: "Surat",

    nextStation: "Vadodara Jn",

    // Surat = 263 km from source.
    // Vadodara = 287.4 km from source.
    // Current-to-next distance = 287.4 - 263 = 24.4 km.
    distanceFromNextStation: "24.4 km to Vadodara Jn",

    latitude: 21.1702,

    longitude: 72.8311,

    speed: 82,

    delay: 6,

    lastUpdated: "12:07:42 PM",

    etaUpdated: "12:07:42 PM",
  },

  // ==================================================
  // ROUTE / STATIONS
  // ==================================================

  stations: [
    {
      name: "Mumbai Central",
      code: "MMCT",
      distance: 0,
      isHalt: true,
      status: "completed",

      arrival: {
        actual: "--",
        predicted: "--",
      },

      departure: {
        actual: "05:00 PM",
        predicted: "05:00 PM",
      },

      confidence: 97,
      confidenceLevel: "High",

      confidenceReason:
        "High confidence because the train has completed its origin station.",
    },

    {
      name: "Borivali",
      code: "BVI",
      distance: 30,
      isHalt: true,
      status: "completed",

      arrival: {
        actual: "05:28 PM",
        predicted: "05:30 PM",
      },

      departure: {
        actual: "05:30 PM",
        predicted: "05:32 PM",
        delay: 2,
      },

      confidence: 94,
      confidenceLevel: "High",

      confidenceReason:
        "Short completed route segment provides relatively low uncertainty.",

      halt: "2m",
    },

    {
      name: "Surat",
      code: "ST",
      distance: 263,
      isHalt: true,
      status: "current",
      isCurrent: true,

      arrival: {
        actual: "11:50 AM",
        predicted: "11:47 AM",
      },

      departure: {
        actual: null,
        predicted: "11:55 AM",
      },

      confidence: 86,
      confidenceLevel: "High",

      confidenceReason:
        "Current position provides a relatively short forecast horizon.",

      halt: "5m",
    },

    {
      name: "Route Point R1",
      code: "R001",
      distance: 280,
      isHalt: false,
      status: "upcoming",

      arrival: {
        actual: null,
        predicted: "12:18 PM",
      },

      departure: {
        actual: null,
        predicted: "12:18 PM",
      },
    },

    {
      name: "Vadodara Jn",
      code: "BRC",
      distance: 287.4,
      isHalt: true,
      status: "upcoming",

      arrival: {
        actual: null,
        predicted: "12:36 PM",
      },

      departure: {
        actual: null,
        predicted: "12:41 PM",
      },

      confidence: 82,
      confidenceLevel: "High",

      confidenceReason:
        "Short-term prediction has relatively narrow uncertainty.",

      halt: "5m",
    },

    {
      name: "Route Point R2",
      code: "R002",
      distance: 310,
      isHalt: false,
      status: "upcoming",

      arrival: {
        actual: null,
        predicted: "12:58 PM",
      },

      departure: {
        actual: null,
        predicted: "12:58 PM",
      },
    },

    {
      name: "Ratlam",
      code: "RTM",
      distance: 480,
      isHalt: true,
      status: "upcoming",

      arrival: {
        actual: null,
        predicted: "03:25 PM",
      },

      departure: {
        actual: null,
        predicted: "03:30 PM",
      },

      confidence: 76,
      confidenceLevel: "Moderate",

      confidenceReason:
        "Prediction uncertainty increases over the longer forecast horizon.",

      halt: "5m",
    },

    {
      name: "Kota Jn",
      code: "KOTA",
      distance: 720,
      isHalt: true,
      status: "upcoming",

      arrival: {
        actual: null,
        predicted: "06:55 PM",
      },

      departure: {
        actual: null,
        predicted: "07:00 PM",
      },

      confidence: 71,
      confidenceLevel: "Moderate",

      confidenceReason:
        "Longer forecast horizon results in wider ETA uncertainty.",

      halt: "5m",
    },

    {
      name: "New Delhi",
      code: "NDLS",
      distance: 1380,
      isHalt: true,
      status: "upcoming",

      arrival: {
        actual: null,
        predicted: "11:30 PM",
      },

      departure: {
        actual: null,
        predicted: "--",
      },

      confidence: 65,
      confidenceLevel: "Moderate",

      confidenceReason:
        "Long-range prediction contains greater uncertainty.",

      halt: "Terminal",
    },
  ],

  // ==================================================
  // DELAY REASON
  // ==================================================

  delayReason: {
    type: "Minor Operational Delay",

    description:
      "A small operational delay is being simulated on the current route section.",

    delay: 6,
  },

  // ==================================================
  // PREDICTION
  // ==================================================

  prediction: {
    etaMinutes: 29,
    eta_minutes: 29,

    p10: 22,
    p50: 29,
    p90: 41,

    canArriveEarlierBy: 7,
    can_arrive_earlier_by: 7,

    canBeDelayedBy: 12,
    can_be_delayed_by: 12,

    nextStation: "Vadodara Jn",
    next_station: "Vadodara Jn",

    speedKmph: 82,
    speed_kmph: 82,

    scheduledArrival: "12:30 PM",
    scheduled_arrival: "12:30 PM",

    predictedArrival: "12:36 PM",
    predicted_arrival: "12:36 PM",

    scheduledEta: "12:30 PM",
    predictedEta: "12:36 PM",

    confidence: 82,
    confidence_score: 82,
    confidenceScore: 82,

    confidence_level: "High",
    confidenceLevel: "High",

    confidence_reason:
      "High confidence due to the relatively short prediction horizon and stable current speed.",

    confidenceReason:
      "High confidence due to the relatively short prediction horizon and stable current speed.",

    predictionAccuracy: null,
    prediction_accuracy: null,
  },

  // ==================================================
  // WEATHER
  // ==================================================

  weather: {
    location: "Vadodara",

    condition: "Clear",

    temperature_c: 31,

    rainfall_mm: 0,

    wind_speed_kmph: 9.1,

    visibility_km: 12,

    humidity_percent: 61,

    impact: "0-2 min",
  },
};


// ======================================================
// ALL MOCK TRAINS
// ======================================================

const mockLiveStatuses = {
  "12002": mock12002,
  "12919": mock12919,
  "12952": mock12952,
};


// ======================================================
// GET MOCK LIVE STATUS
// ======================================================

export const getMockLiveStatus = (
  trainNumber
) => {

  const normalizedTrainNumber =
    String(trainNumber || "")
      .trim()
      .replace(/-/g, "");


  const aliases = {
    "12002": "12002",
    "12919": "12919",
    "12952": "12952",
  };


  const resolvedTrainNumber =
    aliases[normalizedTrainNumber] ||
    normalizedTrainNumber;


  const selectedStatus =
    mockLiveStatuses[
      resolvedTrainNumber
    ];


  if (!selectedStatus) {
    return null;
  }


  // Return a deep copy so one train's data cannot
  // accidentally modify another train's mock response.

  return JSON.parse(
    JSON.stringify(
      selectedStatus
    )
  );
};


// ======================================================
// TRAIN LIST FOR SEARCH / DROPDOWN
// ======================================================

export const mockTrainList = [
  {
    trainNumber: "12002",
    trainName:
      "New Delhi - Rani Kamlapati Shatabdi Express",
    from: "New Delhi",
    to: "Rani Kamlapati",
  },

  {
    trainNumber: "12919",
    trainName:
      "Malwa Express",
    from: "Dr. Ambedkar Nagar",
    to: "Shri Mata Vaishno Devi Katra",
  },

  {
    trainNumber: "12952",
    trainName:
      "Mumbai Central - New Delhi Rajdhani Express",
    from: "Mumbai Central",
    to: "New Delhi",
  },
];


// ======================================================
// DEFAULT EXPORT
//
// Keeps compatibility with existing code that imports
// mockLiveStatus as the default export.
//
// Default remains 12002.
// The API should use getMockLiveStatus(trainNumber)
// when a specific train is requested.
// ======================================================

const mockLiveStatus = mock12002;

export default mockLiveStatus;