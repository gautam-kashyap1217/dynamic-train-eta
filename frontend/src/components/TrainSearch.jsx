import { useState } from "react";
import { useNavigate } from "react-router";

import {
  MapPin,
  CalendarDays,
  Search,
  ArrowLeftRight,
  TrainFront,
  X,
  Radio,
} from "lucide-react";

export default function TrainSearch() {
  const navigate = useNavigate();

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [trainSearch, setTrainSearch] = useState("");

  // ================= SWAP =================
  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  // ================= FIND TRAINS =================
  const handleSearch = () => {
    if (!from.trim() || !to.trim()) {
      alert("Please enter From and To station");
      return;
    }

    navigate("/train-results", {
      state: {
        from,
        to,
        date,
      },
    });
  };

  // ================= LIVE STATUS =================
  const handleLiveStatus = () => {
    if (!trainSearch.trim()) {
      alert("Please enter train number or train name");
      return;
    }

    navigate("/live-status", {
      state: {
        train: trainSearch,
      },
    });
  };

  // ================= CLEAR =================
  const clearTrainSearch = () => {
    setTrainSearch("");
  };

  return (
    <div
      className="
        relative z-10
        mx-6
        -mt-[48px]
        rounded-2xl
        bg-white
        p-3
        shadow-[0_8px_30px_rgba(20,80,140,0.12)]
      "
    >

      {/* ================================================= */}
      {/* MAIN SEARCH */}
      {/* ================================================= */}

      <div
        className="
          grid
          grid-cols-[1fr_38px_1fr_0.8fr_1fr]
          items-center
          gap-2
        "
      >

        {/* ================= FROM ================= */}

        <div
          className="
            flex h-12 items-center gap-3
            rounded-xl
            border border-slate-200
            px-3
            transition
            focus-within:border-blue-500
            focus-within:ring-2
            focus-within:ring-blue-100
          "
        >

          <MapPin
            size={20}
            className="shrink-0 text-blue-600"
          />

          <div className="flex min-w-0 flex-1 flex-col gap-1">

            <label className="text-[11px] text-slate-500">
              From
            </label>

            <input
              type="text"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              placeholder="Enter source station"
              className="
                w-full
                bg-transparent
                text-[12px]
                text-slate-700
                outline-none
                placeholder:text-slate-400
              "
            />

          </div>

        </div>


        {/* ================= SWAP ================= */}

        <button
          type="button"
          onClick={handleSwap}
          title="Swap stations"
          className="
            flex h-9 w-9
            items-center justify-center
            rounded-full
            bg-blue-50
            text-blue-600
            transition
            hover:bg-blue-100
            active:scale-95
          "
        >
          <ArrowLeftRight size={18} />
        </button>


        {/* ================= TO ================= */}

        <div
          className="
            flex h-12 items-center gap-3
            rounded-xl
            border border-slate-200
            px-3
            transition
            focus-within:border-blue-500
            focus-within:ring-2
            focus-within:ring-blue-100
          "
        >

          <MapPin
            size={20}
            className="shrink-0 text-blue-600"
          />

          <div className="flex min-w-0 flex-1 flex-col gap-1">

            <label className="text-[11px] text-slate-500">
              To
            </label>

            <input
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="Enter destination station"
              className="
                w-full
                bg-transparent
                text-[12px]
                text-slate-700
                outline-none
                placeholder:text-slate-400
              "
            />

          </div>

        </div>


        {/* ================= DATE ================= */}

        <div
          className="
            flex h-12 items-center gap-3
            rounded-xl
            border border-slate-200
            px-3
          "
        >

          <CalendarDays
            size={20}
            className="shrink-0 text-blue-600"
          />

          <div className="flex min-w-0 flex-1 flex-col gap-1">

            <label className="text-[11px] text-slate-500">
              Date
            </label>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="
                w-full
                bg-transparent
                text-[12px]
                text-slate-700
                outline-none
              "
            />

          </div>

        </div>


        {/* ================= FIND TRAINS ================= */}

        <button
          type="button"
          onClick={handleSearch}
          className="
            flex h-12
            items-center justify-center
            gap-2
            rounded-xl
            bg-blue-600
            text-xs
            font-semibold
            text-white
            shadow-md
            shadow-blue-200
            transition
            hover:bg-blue-700
            active:scale-[0.98]
          "
        >

          <Search size={18} />

          Find Trains

        </button>

      </div>


      {/* ================================================= */}
      {/* TRAIN NUMBER / NAME SEARCH */}
      {/* ================================================= */}

      <div
        className="
          mt-3
          flex min-h-10
          items-center gap-3
          rounded-xl
          border border-slate-200
          px-4
        "
      >

        {/* Train Icon */}

        <TrainFront
          size={19}
          className="shrink-0 text-blue-600"
        />


        {/* Train Input */}

        <input
          type="text"
          value={trainSearch}
          onChange={(e) => setTrainSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && trainSearch.trim()) {
              handleLiveStatus();
            }
          }}
          placeholder="Search by Train Name or Number (e.g. 12951, Rajdhani Express)"
          className="
            min-w-0
            flex-1
            bg-transparent
            py-2
            text-[11px]
            text-slate-700
            outline-none
            placeholder:text-slate-400
          "
        />


        {/* Clear */}

        {trainSearch && (
          <button
            type="button"
            onClick={clearTrainSearch}
            title="Clear search"
            className="
              shrink-0
              text-slate-400
              transition
              hover:text-slate-700
            "
          >
            <X size={16} />
          </button>
        )}


        {/* ================================================= */}
        {/* LIVE STATUS */}
        {/* ================================================= */}

        {trainSearch.trim() && (
          <button
            type="button"
            onClick={handleLiveStatus}
            className="
              flex shrink-0
              items-center gap-2
              rounded-lg
              bg-emerald-500
              px-4 py-2
              text-[11px]
              font-semibold
              text-white
              shadow-sm
              shadow-emerald-200
              transition
              hover:bg-emerald-600
              active:scale-95
            "
          >

            <Radio size={15} />

            Live Status

          </button>
        )}

      </div>

    </div>
  );
}