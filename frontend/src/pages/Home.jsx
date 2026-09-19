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

        {/* ================= HERO CONTENT ================= */}
        <div className="absolute left-12 top-[35px] text-white">

          {/* ================= RAILZEN BRANDING ================= */}
          <div className="mb-5">

            {/* Product Name */}
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-500/30 px-5 py-2 backdrop-blur border border-white/10">

              <span className="text-base">
                🚆
              </span>

              <span className="text-sm font-bold tracking-[0.18em]">
                RAILZEN
              </span>

            </div>

            {/* Product Description */}
            <p className="mt-2 ml-1 text-[11px] font-medium tracking-wide text-blue-100/80">
              Dynamic Train Intelligence
            </p>

          </div>


          {/* ================= HEADING ================= */}
          <h1 className="text-[48px] font-bold leading-[1.12]">

            Find Your Train, Track

            <br />

            <span className="text-blue-400">
              Your Journey
            </span>

          </h1>


          {/* ================= DESCRIPTION ================= */}
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


          {/* ================= RAILWAY CONTEXT ================= */}
          <div className="mt-5 flex items-center gap-2 text-[11px] text-blue-100/70">

            <span>
              🌐
            </span>

            <span>
              Indian Railways
            </span>

          </div>

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
          Railzen
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