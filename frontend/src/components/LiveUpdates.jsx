import {
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function LiveUpdates() {
  return (
    <div className="relative flex min-h-[90px] overflow-hidden rounded-xl bg-gradient-to-r from-indigo-50 to-blue-100 p-4">

      {/* Icon */}
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
        <Sparkles size={19} />
      </div>


      {/* Content */}
      <div className="ml-3">

        <h2 className="text-sm font-bold text-blue-950">
          Live Updates
        </h2>

        <p className="mt-1 w-[190px] text-[9px] leading-4 text-blue-500">
          Get real-time train location, delay info and accurate ETA predictions.
        </p>

        <button className="mt-2 flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-blue-600">
          <ArrowRight size={15} />
        </button>

      </div>


      {/* Train */}
      <div className="absolute bottom-2 right-4 text-5xl">
        🚄
      </div>

    </div>
  );
}