import TrainSearch from "../components/TrainSearch";
import RecentSearches from "../components/RecentSearches";
import QuickStats from "../components/QuickStats";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50">

      {/* ================= HERO ================= */}
      <section
  className="relative h-[330px] overflow-hidden bg-cover bg-center"
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
        <div className="absolute left-8 top-[20px] text-white">

          {/* Railway Badge */}
          <div className="mb-3 inline-flex rounded-full bg-blue-500/30 px-3 py-1 text-[11px] backdrop-blur">
            🌐 Indian Railways
          </div>

          {/* Heading */}
          <h1 className="text-[29px] font-bold leading-[1.1]">

            Find Your Train, Track

            <br />

            <span className="text-blue-400">
              Your Journey
            </span>

          </h1>

          {/* Description */}
          <p className="mt-3 text-[13px]">
            Get real-time ETA,{" "}
            
            <span className="text-cyan-300">
              live train location
            </span>

            , delays and more.
          </p>

          <p className="mt-1 text-[13px]">
            Plan your journey with confidence.
          </p>

        </div>

      </section>


      {/* ================= SEARCH ================= */}

      <TrainSearch />


      {/* ================= LOWER SECTION ================= */}

      <div className="mx-7 mt-5 grid grid-cols-[1.65fr_1fr] gap-4">

        {/* LEFT */}
        <RecentSearches />


        {/* RIGHT */}
        <div className="space-y-4">

          <QuickStats />

        </div>

      </div>


      {/* ================= FOOTER ================= */}

      <footer className="flex justify-center gap-3 py-5 text-[10px] text-blue-400">

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