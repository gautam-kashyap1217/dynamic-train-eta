import { useLocation, useNavigate, useParams } from "react-router";

import {
  TrainFront,
  MapPin,
  Gauge,
  Clock3,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Navigation,
  AlertTriangle,
  Map,
} from "lucide-react";

export default function TrainDetails() {
  const { trainNumber } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Selected train from Train Results
  const train = location.state?.train || {
    number: trainNumber || "12958",
    name: "August Kranti Rajdhani Express",
    departure: "18:25",
    arrival: "10:35",
    duration: "16h 10m",
    stops: 14,
    status: "Delayed by 1h 12m",
    fare: "₹1,720",
  };

  const from = location.state?.from || "Mumbai CSMT";
  const to = location.state?.to || "New Delhi (NDLS)";
  const date = location.state?.date || "";

  // Open Live Status page
  const handleLiveStatus = () => {
    navigate("/live-status", {
      state: {
        train,
        from,
        to,
        date,
      },
    });
  };

  return (
    <main className="min-h-screen bg-slate-50">
      {/* ================= HEADER ================= */}
      <header className="h-[78px] bg-white border-b border-slate-100 px-7 flex items-center">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-blue-50 flex items-center justify-center">
            <TrainFront size={29} className="text-blue-600" />
          </div>

          <div>
            <h1 className="text-[18px] font-bold text-slate-900">
              Dynamic ETA
            </h1>

            <p className="text-[10px] text-slate-500">
              Smarter Predictions for Better Journeys
            </p>
          </div>
        </div>

        {/* Current Journey */}
        <div className="ml-auto">
          <div className="border-l border-slate-200 pl-6">
            <p className="text-[10px] text-slate-400">
              Current Journey
            </p>

            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-semibold text-slate-800">
                {from}
              </span>

              <ArrowRight
                size={14}
                className="text-blue-500"
              />

              <span className="text-xs font-semibold text-slate-800">
                {to}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ================= BACK BUTTON ================= */}
      <div className="px-7 pt-5">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="
            flex
            items-center
            gap-2
            text-sm
            font-medium
            text-slate-600
            hover:text-blue-600
            transition
          "
        >
          <ArrowLeft size={18} />
          Back to Train Results
        </button>
      </div>

      {/* ================= TRAIN HERO ================= */}
      <section className="mx-7 mt-4 overflow-hidden rounded-2xl">
        <div
          className="
            relative
            min-h-[210px]
            bg-cover
            bg-center
          "
          style={{
            backgroundImage:
              'linear-gradient(90deg, rgba(8,30,60,0.95), rgba(8,30,60,0.65), rgba(8,30,60,0.25)), url("/images/train-hero.jpg")',
          }}
        >
          <div
            className="
              relative
              z-10
              flex
              min-h-[210px]
              items-center
              px-7
            "
          >
            <div>
              {/* Live Badge */}
              <div className="flex items-center gap-3">
                <span
                  className="
                    rounded-full
                    bg-emerald-500
                    px-3
                    py-1
                    text-[10px]
                    font-bold
                    text-white
                  "
                >
                  ● LIVE
                </span>

                <span className="text-xs text-blue-100">
                  Train {train.number}
                </span>
              </div>

              {/* Train Name */}
              <h1
                className="
                  mt-3
                  text-3xl
                  font-bold
                  text-white
                "
              >
                {train.name}
              </h1>

              {/* Route */}
              <p
                className="
                  mt-2
                  text-sm
                  text-blue-100
                "
              >
                {from} → {to}
              </p>

              {/* Train Information */}
              <div className="mt-4 flex items-center gap-3">
                <HeroInfo
                  title="Departure"
                  value={train.departure || "18:25"}
                />

                <HeroInfo
                  title="Arrival"
                  value={train.arrival || "10:35"}
                />

                <HeroInfo
                  title="Duration"
                  value={train.duration || "16h 10m"}
                />

                <HeroInfo
                  title="Stops"
                  value={train.stops || 14}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= LIVE STATUS ================= */}
      <section
        className="
          mx-7
          mt-4
          rounded-xl
          border
          border-slate-100
          bg-white
          px-5
          py-5
        "
      >
        {/* Live Status Heading */}
        <div
          className="
            mb-5
            flex
            items-center
            justify-between
          "
        >
          <div className="flex items-center gap-2">
            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                bg-emerald-50
              "
            >
              <Navigation
                size={18}
                className="text-emerald-600"
              />
            </div>

            <div>
              <h2
                className="
                  text-base
                  font-bold
                  text-slate-900
                "
              >
                Live Status
              </h2>

              <p
                className="
                  text-[10px]
                  text-slate-400
                "
              >
                Real-time train movement
              </p>
            </div>
          </div>

          {/* Live Tracking Badge */}
          <span
            className="
              rounded-full
              bg-emerald-50
              px-3
              py-1.5
              text-[10px]
              font-semibold
              text-emerald-600
            "
          >
            ● Live Tracking
          </span>
        </div>

        {/* ================= LIVE STATS ================= */}
        <div
          className="
            grid
            grid-cols-4
            divide-x
            divide-slate-200
          "
        >
          <LiveStat
            icon={<MapPin size={21} />}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            title="Current Location"
            value="Near Mathura"
            sub="21 km before"
          />

          <LiveStat
            icon={<Gauge size={21} />}
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
            title="Current Speed"
            value="83 km/h"
          />

          <LiveStat
            icon={<Clock3 size={21} />}
            iconBg="bg-red-50"
            iconColor="text-red-500"
            title="Current Delay"
            value="+24 min"
            valueColor="text-red-500"
          />

          <LiveStat
            icon={<RefreshCw size={19} />}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            title="Last Updated"
            value="09:41 AM"
            sub="Just now"
          />
        </div>

        {/* ================= VIEW LIVE STATUS ================= */}
        <div
          className="
            mt-5
            flex
            justify-end
            border-t
            border-slate-100
            pt-4
          "
        >
          <button
            type="button"
            onClick={handleLiveStatus}
            className="
              flex
              items-center
              gap-2
              rounded-lg
              bg-blue-600
              px-5
              py-2.5
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-blue-700
            "
          >
            <Navigation size={16} />
            View Live Train Status
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ================= ETA CARDS ================= */}
      <section
        className="
          mx-7
          mt-4
          grid
          grid-cols-3
          gap-3
        "
      >
        {/* Predicted ETA */}
        <div
          className="
            rounded-xl
            border
            border-blue-100
            bg-blue-50
            p-5
          "
        >
          <p className="text-[10px] text-blue-500">
            Predicted ETA
          </p>

          <p
            className="
              mt-2
              text-2xl
              font-bold
              text-blue-950
            "
          >
            5:38 PM
          </p>

          <p className="mt-1 text-[10px] text-slate-500">
            Scheduled: 5:14 PM
          </p>
        </div>

        {/* Confidence */}
        <div
          className="
            rounded-xl
            border
            border-emerald-100
            bg-emerald-50
            p-5
          "
        >
          <p className="text-[10px] text-emerald-600">
            Prediction Confidence
          </p>

          <p
            className="
              mt-2
              text-2xl
              font-bold
              text-emerald-700
            "
          >
            90%
          </p>

          <p className="mt-1 text-[10px] text-slate-500">
            High confidence
          </p>
        </div>

        {/* Updated */}
        <div
          className="
            rounded-xl
            border
            border-slate-200
            bg-white
            p-5
          "
        >
          <p className="text-[10px] text-slate-400">
            ETA Updated
          </p>

          <p
            className="
              mt-2
              text-2xl
              font-bold
              text-slate-800
            "
          >
            2 mins
          </p>

          <p className="mt-1 text-[10px] text-slate-500">
            Prediction refreshed automatically
          </p>
        </div>
      </section>

      {/* ================= NEXT STATION + ROUTE ================= */}
      <section
        className="
          mx-7
          mt-4
          grid
          grid-cols-2
          gap-4
        "
      >
        {/* Next Station */}
        <div
          className="
            rounded-xl
            border
            border-slate-200
            bg-white
            p-5
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
            "
          >
            <div>
              <p className="text-[10px] text-slate-400">
                Next Station
              </p>

              <h2
                className="
                  mt-1
                  text-lg
                  font-bold
                  text-slate-900
                "
              >
                Mathura Jn
              </h2>

              <p className="text-[10px] text-slate-400">
                MTJ • 21 km away
              </p>
            </div>

            <div
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-full
                bg-blue-50
              "
            >
              <MapPin
                size={22}
                className="text-blue-600"
              />
            </div>
          </div>

          <div
            className="
              mt-5
              flex
              items-center
              justify-between
              rounded-lg
              bg-slate-50
              p-3
            "
          >
            <div>
              <p className="text-[9px] text-slate-400">
                Expected Arrival
              </p>

              <p
                className="
                  text-sm
                  font-bold
                  text-slate-800
                "
              >
                18:31
              </p>
            </div>

            <span
              className="
                rounded-full
                bg-amber-50
                px-3
                py-1
                text-[9px]
                font-semibold
                text-amber-600
              "
            >
              +21 min
            </span>
          </div>
        </div>

        {/* Journey Route */}
        <div
          className="
            rounded-xl
            border
            border-slate-200
            bg-white
            p-5
          "
        >
          <div
            className="
              flex
              items-center
              gap-2
            "
          >
            <Map
              size={18}
              className="text-blue-600"
            />

            <h2
              className="
                text-sm
                font-bold
                text-slate-900
              "
            >
              Journey Route
            </h2>
          </div>

          <div
            className="
              mt-7
              flex
              items-center
              justify-between
            "
          >
            <RoutePoint
              station={from}
              type="Start"
            />

            <div
              className="
                mx-4
                h-px
                flex-1
                bg-blue-200
              "
            />

            <RoutePoint
              station={to}
              type="Destination"
            />
          </div>
        </div>
      </section>

      {/* ================= DELAY REASON ================= */}
      <section
        className="
          mx-7
          mt-4
          rounded-xl
          border
          border-amber-100
          bg-amber-50
          p-5
        "
      >
        <div
          className="
            flex
            items-start
            gap-3
          "
        >
          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-lg
              bg-amber-100
            "
          >
            <AlertTriangle
              size={18}
              className="text-amber-600"
            />
          </div>

          <div>
            <p
              className="
                text-xs
                font-bold
                text-amber-800
              "
            >
              Operational Delay
            </p>

            <p
              className="
                mt-1
                text-[10px]
                leading-5
                text-amber-700
              "
            >
              Due to section congestion between Bhopal Jn
              and Mathura Jn. Current predicted delay is
              approximately 24 minutes.
            </p>
          </div>
        </div>
      </section>

      {/* ================= TRAIN OVERVIEW ================= */}
      <section
        className="
          mx-7
          mt-4
          mb-8
          rounded-xl
          border
          border-slate-200
          bg-white
          p-5
        "
      >
        <div
          className="
            mb-4
            flex
            items-center
            gap-2
          "
        >
          <TrainFront
            size={18}
            className="text-blue-600"
          />

          <h2
            className="
              text-sm
              font-bold
              text-slate-900
            "
          >
            Train Overview
          </h2>
        </div>

        <div
          className="
            grid
            grid-cols-4
            gap-3
          "
        >
          <InfoCard
            title="Train Number"
            value={train.number}
          />

          <InfoCard
            title="Train Type"
            value="Superfast"
          />

          <InfoCard
            title="Total Stops"
            value={`${train.stops || 14} Stations`}
          />

          <InfoCard
            title="General Fare"
            value={train.fare || "₹1,720"}
          />
        </div>
      </section>
    </main>
  );
}

/* =====================================================
   HERO INFO COMPONENT
===================================================== */

function HeroInfo({ title, value }) {
  return (
    <div
      className="
        rounded-lg
        bg-white/10
        px-3
        py-2
        backdrop-blur
      "
    >
      <p className="text-[9px] text-blue-100">
        {title}
      </p>

      <p
        className="
          text-sm
          font-bold
          text-white
        "
      >
        {value}
      </p>
    </div>
  );
}

/* =====================================================
   LIVE STAT COMPONENT
===================================================== */

function LiveStat({
  icon,
  iconBg,
  iconColor,
  title,
  value,
  sub,
  valueColor = "text-slate-800",
}) {
  return (
    <div className="px-4 first:pl-0">
      <div
        className="
          flex
          items-center
          gap-3
        "
      >
        <div
          className={`
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-lg
            ${iconBg}
            ${iconColor}
          `}
        >
          {icon}
        </div>

        <div>
          <p
            className="
              text-[10px]
              text-slate-400
            "
          >
            {title}
          </p>

          <p
            className={`
              mt-1
              text-sm
              font-bold
              ${valueColor}
            `}
          >
            {value}
          </p>

          {sub && (
            <p
              className="
                text-[9px]
                text-slate-400
              "
            >
              {sub}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   ROUTE POINT COMPONENT
===================================================== */

function RoutePoint({ station, type }) {
  return (
    <div className="text-center">
      <div
        className="
          mx-auto
          h-3
          w-3
          rounded-full
          bg-blue-600
        "
      />

      <p
        className="
          mt-2
          text-[10px]
          font-semibold
          text-slate-700
        "
      >
        {station}
      </p>

      <p
        className="
          text-[8px]
          text-slate-400
        "
      >
        {type}
      </p>
    </div>
  );
}

/* =====================================================
   INFO CARD COMPONENT
===================================================== */

function InfoCard({ title, value }) {
  return (
    <div
      className="
        rounded-lg
        bg-slate-50
        p-3
      "
    >
      <p
        className="
          text-[9px]
          text-slate-400
        "
      >
        {title}
      </p>

      <p
        className="
          mt-1
          text-xs
          font-bold
          text-slate-800
        "
      >
        {value}
      </p>
    </div>
  );
}