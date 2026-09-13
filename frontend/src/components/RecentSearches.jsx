import { useState } from "react";
import { useNavigate } from "react-router";

import {
  TrainFront,
  CalendarDays,
  Clock3,
  MapPin,
  Trash2,
  ChevronRight,
  Navigation,
} from "lucide-react";

export default function RecentSearches() {
  const navigate = useNavigate();

  // ==========================================
  // RECENT SEARCH DATA
  // ==========================================

  const [recentSearches, setRecentSearches] = useState([
    {
      number: "12951",
      name: "Mumbai Rajdhani Express",
      from: "NDLS",
      to: "CSMT",
      date: "08 Sep 2025",
      duration: "2h 30m ago",
    },
    {
      number: "12259",
      name: "Howrah Duronto Express",
      from: "HWH",
      to: "NDLS",
      date: "07 Sep 2025",
      duration: "5h 12m ago",
    },
    {
      number: "22891",
      name: "Rajdhani Express",
      from: "BBS",
      to: "NDLS",
      date: "06 Sep 2025",
      duration: "1 day ago",
    },
  ]);

  // ==========================================
  // LIVE TRAIN STATUS
  // ==========================================

  const handleLiveStatus = (train) => {
    navigate("/live-status", {
      state: {
        train: {
          number: train.number,
          name: train.name,
          from: train.from,
          to: train.to,
          status: "Live",
        },
        date: train.date,
      },
    });
  };

  // ==========================================
  // CLEAR ALL
  // ==========================================

  const handleClearAll = () => {
    setRecentSearches([]);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-blue-50 flex items-center justify-center">
            <Clock3 size={18} className="text-blue-600" />
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Recent Searches
            </h2>

            <p className="text-[10px] text-slate-400">
              Your recent train searches
            </p>
          </div>
        </div>

        {/* CLEAR ALL */}

        {recentSearches.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="
              flex
              items-center
              gap-1
              text-[10px]
              font-medium
              text-blue-600
              hover:text-red-500
              transition
            "
          >
            <Trash2 size={13} />
            Clear All
          </button>
        )}
      </div>

      {/* =====================================================
          RECENT SEARCH LIST
      ===================================================== */}

      {recentSearches.length > 0 ? (
        <div className="space-y-2">
          {recentSearches.map((train) => (
            <div
              key={train.number}
              className="
                group
                flex
                items-center
                gap-3
                rounded-xl
                border
                border-slate-100
                px-3
                py-2.5
                transition
                hover:border-blue-200
                hover:bg-blue-50/30
              "
            >
              {/* TRAIN ICON */}

              <div
                className="
                  h-10
                  w-10
                  shrink-0
                  rounded-xl
                  bg-blue-50
                  flex
                  items-center
                  justify-center
                "
              >
                <TrainFront size={20} className="text-blue-600" />
              </div>

              {/* TRAIN INFORMATION */}

              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-slate-400">
                  {train.number}
                </p>

                <h3 className="text-[11px] font-bold text-blue-700 truncate">
                  {train.name}
                </h3>

                {/* ROUTE */}

                <div className="flex items-center gap-1 mt-1">
                  <MapPin size={10} className="text-slate-400" />

                  <span className="text-[9px] text-slate-500">
                    {train.from}
                  </span>

                  <ChevronRight
                    size={10}
                    className="text-slate-400"
                  />

                  <span className="text-[9px] text-slate-500">
                    {train.to}
                  </span>
                </div>
              </div>

              {/* DATE + TIME */}

              <div className="w-[125px] shrink-0">
                <div className="flex items-center gap-1">
                  <CalendarDays
                    size={12}
                    className="text-slate-400"
                  />

                  <span className="text-[9px] text-slate-500">
                    {train.date}
                  </span>
                </div>

                <div className="flex items-center gap-1 mt-1">
                  <Clock3
                    size={11}
                    className="text-slate-400"
                  />

                  <span className="text-[9px] text-slate-400">
                    {train.duration}
                  </span>
                </div>
              </div>

              {/* =================================================
                  LIVE TRAIN BUTTON
              ================================================= */}

              <button
                type="button"
                onClick={() => handleLiveStatus(train)}
                className="
                  shrink-0
                  flex
                  items-center
                  gap-1.5
                  rounded-full
                  bg-blue-50
                  px-4
                  py-2
                  text-[9px]
                  font-semibold
                  text-blue-600
                  transition
                  hover:bg-blue-600
                  hover:text-white
                  active:scale-95
                "
              >
                <Navigation size={12} />
                Live Train
              </button>

              {/* =================================================
                  ARROW BUTTON
              ================================================= */}

              <button
                type="button"
                onClick={() => handleLiveStatus(train)}
                className="
                  h-8
                  w-8
                  shrink-0
                  rounded-full
                  bg-blue-50
                  flex
                  items-center
                  justify-center
                  text-blue-600
                  transition
                  hover:bg-blue-600
                  hover:text-white
                  active:scale-95
                "
              >
                <ChevronRight size={15} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        /* =====================================================
           EMPTY STATE
        ===================================================== */

        <div className="py-10 text-center">
          <div
            className="
              mx-auto
              h-12
              w-12
              rounded-full
              bg-slate-50
              flex
              items-center
              justify-center
            "
          >
            <Clock3 size={22} className="text-slate-300" />
          </div>

          <p className="text-sm font-semibold text-slate-500 mt-3">
            No recent searches
          </p>

          <p className="text-[10px] text-slate-400 mt-1">
            Your recent train searches will appear here
          </p>
        </div>
      )}
    </div>
  );
}