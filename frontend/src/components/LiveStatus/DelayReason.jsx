import React from "react";
import {
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

const DelayReason = ({ delayReason }) => {

  if (!delayReason) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4">

      {/* Header */}
      <div className="flex items-center gap-3 mb-3">

        <AlertTriangle
          size={22}
          className="text-red-500"
        />

        <h2 className="text-base font-bold text-slate-900">
          Delay Reason
        </h2>

      </div>


      {/* Delay Card */}
      <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-center gap-3">

        <div className="h-11 w-11 rounded-full bg-red-100 flex items-center justify-center shrink-0">

          <RefreshCw
            size={22}
            className="text-red-500"
          />

        </div>


        <div className="flex-1">

          <p className="text-xs font-bold text-red-700">
            {delayReason.type}
          </p>

          <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
            {delayReason.description}
          </p>

        </div>


        <span className="px-3 py-1.5 rounded-full bg-red-100 text-red-600 text-xs font-bold whitespace-nowrap">
          +{delayReason.delay} min
        </span>

      </div>

    </div>
  );
};

export default DelayReason;