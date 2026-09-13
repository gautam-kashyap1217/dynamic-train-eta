import { useState } from "react";
import { useLocation, useNavigate } from "react-router";

import {
  MapPin,
  ArrowLeftRight,
  ArrowLeft,
  TrainFront,
  CalendarDays,
  IndianRupee,
  ArrowDownUp,
  Navigation,
} from "lucide-react";

// =====================================================
// TRAIN DATA
// =====================================================

const trains = [
  {
    number: "12951",
    name: "Mumbai Rajdhani Express",
    departure: "16:55",
    arrival: "09:30",
    duration: "16h 35m",
    stops: 12,
    status: "On Time",
    delay: "",
    fare: "₹1,745",
  },
  {
    number: "12952",
    name: "Mumbai Rajdhani Express",
    departure: "17:15",
    arrival: "09:40",
    duration: "16h 25m",
    stops: 12,
    status: "Delayed by 32 min",
    delay: "delay",
    fare: "₹1,745",
  },
  {
    number: "12958",
    name: "August Kranti Rajdhani Express",
    departure: "18:25",
    arrival: "10:35",
    duration: "16h 10m",
    stops: 14,
    status: "Delayed by 1h 12m",
    delay: "danger",
    fare: "₹1,720",
  },
  {
    number: "12260",
    name: "Mahananda Express",
    departure: "19:10",
    arrival: "14:00",
    duration: "16h 50m",
    stops: 10,
    status: "On Time",
    delay: "",
    fare: "₹1,530",
  },
  {
    number: "12954",
    name: "Poorva Express",
    departure: "20:05",
    arrival: "13:50",
    duration: "17h 45m",
    stops: 12,
    status: "On Time",
    delay: "",
    fare: "₹1,380",
  },
  {
    number: "12424",
    name: "Adi Shakti Express",
    departure: "21:30",
    arrival: "16:50",
    duration: "19h 20m",
    stops: 16,
    status: "Delayed by 45 min",
    delay: "danger",
    fare: "₹1,245",
  },
  {
    number: "11078",
    name: "LTT Express",
    departure: "22:45",
    arrival: "17:15",
    duration: "18h 30m",
    stops: 14,
    status: "On Time",
    delay: "",
    fare: "₹1,180",
  },
  {
    number: "12988",
    name: "Chhatrapati Express",
    departure: "23:10",
    arrival: "17:05",
    duration: "17h 55m",
    stops: 13,
    status: "Delayed by 20 min",
    delay: "delay",
    fare: "₹1,320",
  },
];

// =====================================================
// TRAIN RESULTS PAGE
// =====================================================

export default function TrainResults() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    from = "New Delhi (NDLS)",
    to = "Mumbai Central (MMCT)",
    date = "",
  } = location.state || {};

  // =====================================================
  // DATE STATE
  // =====================================================

  const [selectedDate, setSelectedDate] = useState(date);

  // =====================================================
  // LIVE TRAIN STATUS
  // =====================================================

  const handleLiveStatus = (train) => {
    navigate("/live-status", {
      state: {
        train,
        from,
        to,
        date: selectedDate,
      },
    });
  };

  // =====================================================
  // TRAIN DETAILS
  // =====================================================

  const handleViewDetails = (train) => {
    navigate(`/train/${train.number}`, {
      state: {
        train,
        from,
        to,
        date: selectedDate,
      },
    });
  };

  // =====================================================
  // BACK BUTTON
  // =====================================================

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <main className="min-h-screen bg-slate-50">

      {/* =====================================================
          BACK BUTTON
      ===================================================== */}

      <div className="px-8 pt-4">
        <button
          type="button"
          onClick={handleBack}
          className="
            flex
            items-center
            gap-2
            text-sm
            font-medium
            text-slate-600
            transition
            hover:text-blue-600
          "
        >
          <ArrowLeft size={18} />
          Back
        </button>
      </div>

      {/* =====================================================
          TOP SEARCH
      ===================================================== */}

      <div className="mt-3 border-b border-slate-200 bg-white px-8 py-4">
        <div className="flex items-center gap-3">

          {/* ================= FROM ================= */}

          <div
            className="
              flex
              h-14
              flex-1
              items-center
              gap-3
              rounded-xl
              border
              border-slate-200
              px-4
            "
          >
            <MapPin
              size={21}
              className="text-blue-600"
            />

            <div>
              <p className="text-[10px] text-slate-400">
                From
              </p>

              <p className="text-sm font-semibold text-slate-800">
                {from}
              </p>
            </div>
          </div>

          {/* ================= SWAP ================= */}

          <button
            type="button"
            onClick={() => navigate("/")}
            title="Change journey"
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-blue-50
              text-blue-600
              transition
              hover:bg-blue-100
            "
          >
            <ArrowLeftRight size={17} />
          </button>

          {/* ================= TO ================= */}

          <div
            className="
              flex
              h-14
              flex-1
              items-center
              gap-3
              rounded-xl
              border
              border-slate-200
              px-4
            "
          >
            <MapPin
              size={21}
              className="text-blue-600"
            />

            <div>
              <p className="text-[10px] text-slate-400">
                To
              </p>

              <p className="text-sm font-semibold text-slate-800">
                {to}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          SEARCH RESULTS HEADER
      ===================================================== */}

      <section
        className="
          mx-8
          mt-4
          overflow-hidden
          rounded-2xl
          bg-gradient-to-r
          from-blue-50
          to-sky-100
          px-6
          py-5
        "
      >
        <div className="flex items-center justify-between">

          <div>
            <span
              className="
                inline-flex
                rounded-full
                bg-blue-100
                px-3
                py-1
                text-[11px]
                font-semibold
                text-blue-600
              "
            >
              Search Results
            </span>

            <h1 className="mt-2 text-2xl font-bold text-blue-950">
              Trains from {from} to {to}
            </h1>

            <p className="mt-1 text-xs text-slate-500">
              Find the best trains, check live status, fares and schedule.
            </p>
          </div>

          <TrainFront
            size={90}
            className="mr-12 text-blue-500"
          />
        </div>
      </section>

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <section
        className="
          mx-8
          mt-3
          rounded-xl
          border
          border-slate-200
          bg-white
          p-3
        "
      >
        <div className="grid grid-cols-4 gap-3">

          {/* ================= TRAVEL DATE ================= */}

          <label
            className="
              flex
              cursor-pointer
              items-center
              gap-3
              rounded-lg
              border
              border-slate-200
              p-3
              text-left
              transition
              hover:border-blue-300
            "
          >
            <CalendarDays
              size={20}
              className="shrink-0 text-blue-600"
            />

            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-slate-400">
                Travel Date
              </p>

              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="
                  mt-1
                  w-full
                  cursor-pointer
                  bg-transparent
                  text-xs
                  font-semibold
                  text-slate-800
                  outline-none
                "
              />
            </div>
          </label>

          {/* ================= FARE ================= */}

          <button
            type="button"
            className="
              flex
              items-center
              gap-3
              rounded-lg
              border
              border-slate-200
              p-3
              text-left
              transition
              hover:border-blue-300
            "
          >
            <IndianRupee
              size={20}
              className="text-blue-600"
            />

            <div>
              <p className="text-[10px] text-slate-400">
                Show Fares
              </p>

              <p className="text-xs font-semibold text-slate-800">
                General Fare
              </p>
            </div>
          </button>

          {/* ================= SORT ================= */}

          <button
            type="button"
            className="
              flex
              items-center
              gap-3
              rounded-lg
              border
              border-slate-200
              p-3
              text-left
              transition
              hover:border-blue-300
            "
          >
            <ArrowDownUp
              size={20}
              className="text-blue-600"
            />

            <div>
              <p className="text-[10px] text-slate-400">
                Sort By
              </p>

              <p className="text-xs font-semibold text-slate-800">
                Departure Time
              </p>
            </div>
          </button>

          {/* ================= LIVE TRAIN STATUS ================= */}

          <button
            type="button"
            onClick={() => handleLiveStatus(trains[0])}
            className="
              flex
              items-center
              justify-center
              gap-2
              rounded-lg
              border
              border-emerald-200
              bg-emerald-50
              text-xs
              font-semibold
              text-emerald-600
              transition
              hover:border-emerald-300
              hover:bg-emerald-100
            "
          >
            <Navigation size={18} />
            Live Train Status
          </button>
        </div>
      </section>

      {/* =====================================================
          TRAIN LIST
      ===================================================== */}

      <section className="mx-8 mt-5 pb-10">

        <div className="mb-3 flex items-center justify-between">

          <h2 className="text-sm font-bold text-blue-950">
            Available Trains ({trains.length})
          </h2>

          <span className="text-[10px] text-slate-400">
            Last updated: 09:41 AM
          </span>
        </div>

        {/* =====================================================
            TRAIN CARDS
        ===================================================== */}

        <div className="space-y-2">

          {trains.map((train) => (
            <div
              key={train.number}
              className="
                rounded-xl
                border
                border-slate-200
                bg-white
                px-4
                py-4
                transition
                hover:border-blue-300
                hover:shadow-sm
              "
            >
              <div
                className="
                  grid
                  grid-cols-[55px_1.4fr_1.2fr_1fr_1fr_220px]
                  items-center
                  gap-4
                "
              >

                {/* ================= TRAIN ICON ================= */}

                <div className="flex justify-center">
                  <TrainFront
                    size={30}
                    className="text-blue-600"
                  />
                </div>

                {/* ================= TRAIN NAME ================= */}

                <div>
                  <p className="text-[11px] text-slate-400">
                    {train.number}
                  </p>

                  <h3 className="text-xs font-bold text-blue-950">
                    {train.name}
                  </h3>

                  <div className="mt-2 flex gap-1">
                    {[
                      "Mon",
                      "Tue",
                      "Wed",
                      "Thu",
                      "Fri",
                      "Sat",
                      "Sun",
                    ].map((day) => (
                      <span
                        key={day}
                        className="
                          rounded-full
                          bg-blue-50
                          px-1.5
                          py-0.5
                          text-[8px]
                          text-blue-600
                        "
                      >
                        {day}
                      </span>
                    ))}
                  </div>
                </div>

                {/* ================= TIME ================= */}

                <div className="flex items-center gap-5">

                  {/* DEPARTURE */}

                  <div>
                    <p className="text-sm font-bold text-blue-950">
                      {train.departure}
                    </p>

                    <p className="text-[10px] text-slate-400">
                      {from.split(" ")[0]}
                    </p>
                  </div>

                  {/* JOURNEY LINE */}

                  <div className="flex flex-col items-center">

                    <span className="text-[9px] text-slate-400">
                      {train.duration}
                    </span>

                    <div className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />

                      <div className="h-px w-14 bg-blue-200" />

                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                    </div>

                    <span className="text-[9px] text-slate-400">
                      {train.stops} Stops
                    </span>
                  </div>

                  {/* ARRIVAL */}

                  <div>
                    <p className="text-sm font-bold text-blue-950">
                      {train.arrival}
                    </p>

                    <p className="text-[10px] text-slate-400">
                      {to.split(" ")[0]}
                    </p>
                  </div>
                </div>

                {/* ================= STATUS ================= */}

                <div>
                  <span
                    className={`
                      inline-flex
                      rounded-full
                      px-3
                      py-1.5
                      text-[9px]
                      font-semibold
                      ${
                        train.delay === ""
                          ? "bg-emerald-50 text-emerald-600"
                          : train.delay === "danger"
                          ? "bg-red-50 text-red-500"
                          : "bg-amber-50 text-amber-600"
                      }
                    `}
                  >
                    ● {train.status}
                  </span>
                </div>

                {/* ================= FARE ================= */}

                <div>
                  <p className="text-[10px] text-slate-400">
                    From
                  </p>

                  <p className="text-sm font-bold text-blue-950">
                    {train.fare}
                  </p>

                  <p className="text-[9px] text-slate-400">
                    (General Fare)
                  </p>
                </div>

                {/* ================= ACTION BUTTONS ================= */}

                <div className="flex items-center justify-end gap-2">

                  {/* VIEW DETAILS */}


                  {/* LIVE TRAIN */}

                  <button
                    type="button"
                    onClick={() => handleLiveStatus(train)}
                    className="
                      flex
                      items-center
                      gap-1.5
                      rounded-lg
                      bg-emerald-500
                      px-3
                      py-2
                      text-[10px]
                      font-semibold
                      text-white
                      transition
                      hover:bg-emerald-600
                    "
                  >
                    <Navigation size={13} />
                    Live Train
                  </button>

                </div>
              </div>
            </div>
          ))}

        </div>
      </section>
    </main>
  );
}