import React from "react";

import {
  MapPin,
  Gauge,
  Clock3,
  RefreshCw,
  Radio,
} from "lucide-react";

const formatDelay = (delay) => {
  const totalMinutes = Math.max(
    0,
    Math.round(Number(delay) || 0)
  );

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `+${hours} hr ${minutes} min`;
  }

  if (hours > 0) {
    return `+${hours} hr`;
  }

  return `+${minutes} min`;
};

const LiveStats = ({ live }) => {
  const stats = [
    {
      label: "Current Location",
      value: live.currentLocation,
      sub: live.distanceFromNextStation,
      icon: MapPin,
    },
    {
      label: "Estimated Speed",
      value: `${live.speed} km/h`,
      sub: "Prototype estimated segment speed",
      icon: Gauge,
    },
    {
      label: "Current Delay",
      value: formatDelay(live.delay),
      icon: Clock3,
    },
    {
      label: "Last Updated",
      value: live.lastUpdated,
      icon: RefreshCw,
    },
    {
      label: "ETA Updated",
      value: live.etaUpdated,
      icon: Radio,
    },
  ];

  return (
    <div className="grid grid-cols-5 gap-3 mt-4">
      {stats.map((item, index) => {
        const Icon = item.icon;

        return (
          <div
            key={index}
            className="bg-white rounded-xl border border-slate-200 p-4"
          >
            <div className="flex items-start gap-3">
              <Icon
                size={25}
                className="text-blue-600 mt-1"
              />

              <div>
                <p className="text-xs text-slate-400">
                  {item.label}
                </p>

                <p className="text-base font-bold text-slate-800 mt-1">
                  {item.value}
                </p>

                {item.sub && (
                  <p className="text-[10px] text-slate-400 mt-1">
                    {item.sub}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LiveStats;