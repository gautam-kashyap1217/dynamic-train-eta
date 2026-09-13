import React from "react";

const LiveTrainHeader = ({ train }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Train Image */}
          <div className="h-16 w-24 rounded-xl overflow-hidden bg-blue-50 border border-slate-200">
            <img
              src="/images/train-hero.png"
              alt="Train"
              className="h-full w-full object-cover"
            />
          </div>

          {/* Train Details */}
          <div>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-sm font-bold">
                {train.number}
              </span>

              <h1 className="text-2xl font-bold text-slate-900">
                {train.name}
              </h1>
            </div>

            <p className="text-base text-slate-500 mt-2">
              {train.from}

              <span className="mx-3 text-blue-600">
                →
              </span>

              {train.to}
            </p>
          </div>
        </div>

        {/* Status */}
        <div className="px-5 py-2 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
          ● {train.status}
        </div>
      </div>
    </div>
  );
};

export default LiveTrainHeader;