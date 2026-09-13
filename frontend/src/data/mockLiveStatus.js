const mockLiveStatus = {
  train: {
    number: "12951",
    name: "Mumbai Rajdhani Express",
    type: "Superfast",
    from: "Mumbai CSMT",
    to: "New Delhi (NDLS)",
    status: "On Time",
  },

live: {
  currentLocation: "Near Mathura",
  distanceFromNextStation: "21 km before",

  latitude: 27.4924,
  longitude: 77.6737,

  speed: 83,
  delay: 24,
  lastUpdated: "09:41 AM",
  etaUpdated: "2 mins ago",
},

  stations: [
    {
      name: "Mumbai CSMT",
      code: "CSMT",
      distance: 0,
      arrival: {
        actual: "--",
        predicted: "(Departure)",
      },
      departure: {
        actual: "18:20",
        predicted: "(18:15 - 18:25)",
        delay: 10,
      },
      confidence: 96,
      status: "completed",
    },

    {
      name: "Bhopal Jn",
      code: "BPL",
      distance: 545,
      arrival: {
        actual: "16:45",
        predicted: "(16:40 - 16:55)",
      },
      departure: {
        actual: "16:50",
        predicted: "(16:45 - 16:55)",
        delay: 5,
      },
      confidence: 92,
      status: "completed",
    },

    {
      name: "Jhansi Jn",
      code: "JHS",
      distance: 725,
      arrival: {
        actual: "18:05",
        predicted: "(17:58 - 18:12)",
        delay: 7,
      },
      departure: {
        actual: "18:15",
        predicted: "(18:08 - 18:22)",
        delay: 8,
      },
      confidence: 88,
      halt: "10m",
      status: "completed",
    },

    {
      name: "Mathura Jn",
      code: "MTJ",
      distance: 840,
      arrival: {
        actual: "18:31",
        predicted: "(18:25 - 18:47)",
        delay: 6,
      },
      departure: {
        actual: "18:41",
        predicted: "(18:35 - 18:57)",
        delay: 6,
      },
      confidence: 78,
      halt: "10m",
      status: "current",
    },

    {
      name: "New Delhi (NDLS)",
      code: "NDLS",
      distance: 1130,
      arrival: {
        actual: "21:30",
        predicted: "(21:21 - 21:39)",
        delay: 9,
      },
      departure: {
        actual: "21:45",
        predicted: "(21:36 - 21:54)",
        delay: 9,
      },
      confidence: 75,
      halt: "15m",
      status: "upcoming",
    },
  ],

  delayReason: {
    type: "Operational Delay",
    description:
      "Due to section congestion between Bhopal Jn and Mathura Jn.",
    delay: 24,
  },

  prediction: {
    scheduledEta: "09:30 AM",
    predictedEta: "09:54 AM",
    confidence: 78,
  },

  weather: {
    condition: "Light Rain",
    impact: "+0-3 min",
  },
};

export default mockLiveStatus;