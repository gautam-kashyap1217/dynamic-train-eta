
import TrainSearch from "../components/TrainSearch";
import RecentSearches from "../components/RecentSearches";
import QuickStats from "../components/QuickStats";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">

      {/* ================= HERO ================= */}
      <section
        className="relative h-[430px] overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: `
            linear-gradient(
              90deg,
              rgba(4,48,105,0.97) 0%,
              rgba(8,70,130,0.82) 35%,
              rgba(8,70,130,0.30) 70%,
              rgba(8,70,130,0.05) 100%
            ),
            url("/images/train-hero.png")
          `,
          backgroundPosition: "67% 64%",
        }}
      >

        {/* Hero Content */}
        <div className="absolute left-12 top-[45px] text-white">

          {/* Railway Badge */}
          <div className="mb-5 inline-flex rounded-full bg-blue-500/30 px-5 py-2 text-sm backdrop-blur">
            🌐 Indian Railways
          </div>

          {/* Heading */}
          <h1 className="text-[48px] font-bold leading-[1.12]">

            Find Your Train, Track

            <br />

            <span className="text-blue-400">
              Your Journey
            </span>

          </h1>

          {/* Description */}
          <p className="mt-6 text-[18px]">
            Get real-time ETA,{" "}

            <span className="text-cyan-300">
              live train location
            </span>

            , delays and more.
          </p>

          <p className="mt-2 text-[18px]">
            Plan your journey with confidence.
          </p>

        </div>

      </section>


      {/* ================= SEARCH ================= */}

      <div className="relative z-10 -mt-2">
        <TrainSearch />
      </div>


      {/* ================= LOWER SECTION ================= */}

      <div className="mx-10 mt-8 grid grid-cols-[1.65fr_1fr] gap-6">

        {/* LEFT */}
        <RecentSearches />

        {/* RIGHT */}
        <div className="space-y-6">
          <QuickStats />
        </div>

      </div>


      {/* ================= FOOTER ================= */}

      <footer className="flex justify-center gap-5 py-8 text-sm text-blue-400">

        <span>
          Indian Railways
        </span>

        <span>|</span>

        <span>
          Real-time ETA
        </span>

        <span>|</span>

        <span>
          Better Planning
        </span>

        <span>|</span>

        <span>
          Happier Journeys
        </span>

      </footer>

    </main>
  );
}