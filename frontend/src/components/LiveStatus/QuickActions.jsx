import React from "react";

import {
  Bell,
  Map,
  CloudRain,
  Brain,
  ChevronRight,
} from "lucide-react";

const formatDuration = (minutes) => {
  if (minutes === null || minutes === undefined || Number.isNaN(Number(minutes))) {
    return "--";
  }

  const totalMinutes = Math.max(0, Math.round(Number(minutes)));
  const hours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  if (hours > 0 && remainingMinutes > 0) {
    return `${hours} hr ${remainingMinutes} min`;
  }

  if (hours > 0) {
    return `${hours} hr`;
  }

  return `${remainingMinutes} min`;
};

const QuickActions = ({ weather, prediction }) => {
  const etaText = prediction
    ? formatDuration(prediction.etaMinutes)
    : "Unavailable";

  const p10Text = prediction
    ? formatDuration(prediction.p10)
    : "--";

  const p90Text = prediction
    ? formatDuration(prediction.p90)
    : "--";

  const actions = [
    {
      title: "Alerts",
      description: "Delay notifications for major stations",
      icon: Bell,
      iconBg: "bg-red-50",
      iconColor: "text-red-500",
      bg: "bg-red-50/60",
    },
    {
      title: "ML ETA Prediction",
      description: prediction
        ? `Expected arrival: ${etaText}`
        : "Prediction unavailable",
      extra: prediction
        ? `Range: ${p10Text} - ${p90Text}`
        : "Waiting for ETA model",
      icon: Brain,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
      bg: "bg-purple-50/60",
    },
    {
      title: "Route Map",
      description: "Track train on the map",
      icon: Map,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
      bg: "bg-blue-50/60",
    },
    {
      title: "Weather",
      description: `(${weather?.condition || "Light Rain"})`,
      extra: `Impact: ${weather?.impact || "+0-3 min"}`,
      icon: CloudRain,
      iconBg: "bg-yellow-50",
      iconColor: "text-yellow-600",
      bg: "bg-yellow-50/70",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {actions.map((action) => {
        const Icon = action.icon;

        return (
          <button
            key={action.title}
            type="button"
            className={`
              ${action.bg}
              border border-slate-200
              rounded-xl
              p-3
              text-left
              hover:shadow-sm
              transition
              group
            `}
          >
            {/* Icon */}
            <div
              className={`
                h-8 w-8
                rounded-lg
                ${action.iconBg}
                flex items-center justify-center
              `}
            >
              <Icon
                size={17}
                className={action.iconColor}
              />
            </div>

            {/* Title */}
            <p className="text-[11px] font-bold text-slate-800 mt-2">
              {action.title}
            </p>

            {/* Description */}
            <p className="text-[9px] text-slate-500 mt-1 leading-relaxed">
              {action.description}
            </p>

            {/* Extra information */}
            {action.extra && (
              <p className="text-[9px] text-slate-500 mt-1">
                {action.extra}
              </p>
            )}

            {/* Arrow */}
            <div className="flex justify-end mt-1">
              <ChevronRight
                size={14}
                className="
                  text-blue-500
                  group-hover:translate-x-1
                  transition
                "
              />
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default QuickActions;