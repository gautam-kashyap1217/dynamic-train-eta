import React, { useMemo, useState } from "react";
import { Link } from "react-router";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Clock3,
  Gauge,
  Info,
  Target,
  TrendingDown,
  TrendingUp,
  XCircle,
} from "lucide-react";

/*
  Dynamic Train ETA — Benchmarking Demonstration UI

  IMPORTANT:
  - This page is intentionally frontend-only.
  - It does NOT call the backend.
  - It does NOT modify CSV files.
  - It does NOT call RailRadar, Weather, Live Status, or any other API.
  - Values below are demonstration values for the prototype presentation.
*/

const DEMO_METRICS = {
  totalPredictions: 96,
  validatedPredictions: 84,
  pendingPredictions: 12,
  mae: 3.8,
  rmse: 5.6,
  withinFiveMinutes: 87.5,
  meanError: -0.7,
  maxAbsoluteError: 14.2,
  avgInferenceTime: 42,
};

const ERROR_BARS = [
  { label: "0–2 min", value: 31 },
  { label: "2–5 min", value: 43 },
  { label: "5–10 min", value: 17 },
  { label: "10+ min", value: 9 },
];

const RECENT_VALIDATIONS = [
  {
    train: "12919",
    station: "KSV",
    predicted: "20:35",
    actual: "20:37",
    error: "+2 min",
    status: "Within target",
  },
  {
    train: "12919",
    station: "AGC",
    predicted: "21:42",
    actual: "21:39",
    error: "-3 min",
    status: "Within target",
  },
  {
    train: "12919",
    station: "DHO",
    predicted: "23:08",
    actual: "23:14",
    error: "+6 min",
    status: "Review",
  },
  {
    train: "12919",
    station: "MRA",
    predicted: "00:31",
    actual: "00:29",
    error: "-2 min",
    status: "Within target",
  },
  {
    train: "12919",
    station: "LAR",
    predicted: "02:16",
    actual: "02:20",
    error: "+4 min",
    status: "Within target",
  },
];

const formatMetric = (value, suffix = "") =>
  `${Number(value).toFixed(1)}${suffix}`;

const StatusBadge = ({ status }) => {
  const isGood = status === "Within target";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
        isGood
          ? "bg-emerald-50 text-emerald-700"
          : "bg-amber-50 text-amber-700"
      }`}
    >
      {isGood ? <CheckCircle2 size={13} /> : <Clock3 size={13} />}
      {status}
    </span>
  );
};

const MetricCard = ({
  icon: Icon,
  label,
  value,
  subtitle,
  accent = "blue",
}) => {
  const accentClasses = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    violet: "bg-violet-50 text-violet-600",
    amber: "bg-amber-50 text-amber-600",
    slate: "bg-slate-100 text-slate-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
            {value}
          </p>
          <p className="mt-1 text-xs font-medium text-slate-400">{subtitle}</p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            accentClasses[accent] || accentClasses.blue
          }`}
        >
          <Icon size={21} />
        </div>
      </div>
    </div>
  );
};

function BenchmarkingDemo() {
  const [activeTab, setActiveTab] = useState("overview");

  const validatedPercentage = useMemo(
    () =>
      (DEMO_METRICS.validatedPredictions / DEMO_METRICS.totalPredictions) *
      100,
    []
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              to="/controller"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
              title="Back to Control Center"
            >
              <ArrowLeft size={19} />
            </Link>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <BarChart3 size={20} />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-lg font-extrabold tracking-tight text-slate-900">
                ETA Model Evaluation
              </h1>
              <p className="truncate text-xs font-medium text-slate-500">
                Prediction accuracy & validation
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              Prototype Evaluation
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-7 lg:px-8">
        {/* Intro */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:p-7">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div className="max-w-3xl">
              <div className="mb-3 flex items-center gap-2">
                <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-extrabold uppercase tracking-wide text-blue-700">
                  Model Performance
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  Demo view
                </span>
              </div>

              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 lg:text-3xl">
                How accurately is the ETA model predicting arrivals?
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Compare predicted arrival times against validated actual
                arrivals and monitor prediction error across the evaluation
                set.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Target className="text-blue-600" size={21} />
              <div>
                <p className="text-xs font-semibold text-slate-400">
                  Evaluation Set
                </p>
                <p className="text-sm font-extrabold text-slate-800">
                  {DEMO_METRICS.totalPredictions} predictions
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <div className="mt-6 flex gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
          {[
            ["overview", "Overview"],
            ["validation", "Validation Records"],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                activeTab === id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === "overview" ? (
          <>
            {/* Primary metrics */}
            <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                icon={Gauge}
                label="MAE"
                value={`${formatMetric(DEMO_METRICS.mae)} min`}
                subtitle="Mean Absolute Error"
                accent="blue"
              />

              <MetricCard
                icon={TrendingDown}
                label="RMSE"
                value={`${formatMetric(DEMO_METRICS.rmse)} min`}
                subtitle="Root Mean Square Error"
                accent="violet"
              />

              <MetricCard
                icon={Target}
                label="Within ±5 min"
                value={`${formatMetric(
                  DEMO_METRICS.withinFiveMinutes
                )}%`}
                subtitle="Predictions within target"
                accent="emerald"
              />

              <MetricCard
                icon={CheckCircle2}
                label="Validated"
                value={`${DEMO_METRICS.validatedPredictions}`}
                subtitle={`of ${DEMO_METRICS.totalPredictions} predictions`}
                accent="amber"
              />
            </section>

            {/* Validation progress + error summary */}
            <section className="mt-6 grid gap-6 lg:grid-cols-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Validation Coverage
                    </h3>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      Predictions with an available actual arrival
                    </p>
                  </div>

                  <span className="text-lg font-extrabold text-blue-600">
                    {validatedPercentage.toFixed(0)}%
                  </span>
                </div>

                <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all"
                    style={{ width: `${validatedPercentage}%` }}
                  />
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-emerald-50 p-4">
                    <p className="text-xs font-bold text-emerald-600">
                      Validated Predictions
                    </p>
                    <p className="mt-1 text-2xl font-extrabold text-emerald-800">
                      {DEMO_METRICS.validatedPredictions}
                    </p>
                  </div>

                  <div className="rounded-xl bg-amber-50 p-4">
                    <p className="text-xs font-bold text-amber-600">
                      Pending Validation
                    </p>
                    <p className="mt-1 text-2xl font-extrabold text-amber-800">
                      {DEMO_METRICS.pendingPredictions}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
                <h3 className="text-base font-extrabold text-slate-900">
                  Error Summary
                </h3>

                <div className="mt-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-500">
                      Mean Error
                    </span>
                    <span className="text-sm font-extrabold text-slate-800">
                      {formatMetric(DEMO_METRICS.meanError)} min
                    </span>
                  </div>

                  <div className="h-px bg-slate-100" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-500">
                      Maximum Absolute Error
                    </span>
                    <span className="text-sm font-extrabold text-slate-800">
                      {formatMetric(DEMO_METRICS.maxAbsoluteError)} min
                    </span>
                  </div>

                  <div className="h-px bg-slate-100" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-500">
                      Avg. Inference Time
                    </span>
                    <span className="text-sm font-extrabold text-slate-800">
                      {DEMO_METRICS.avgInferenceTime} ms
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Error distribution */}
            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Prediction Error Distribution
                  </h3>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    Distribution of validated predictions by absolute error
                  </p>
                </div>

                <div className="text-xs font-bold text-slate-400">
                  Total: {DEMO_METRICS.validatedPredictions}
                </div>
              </div>

              <div className="mt-7 space-y-5">
                {ERROR_BARS.map((item) => (
                  <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-600">
                        {item.label}
                      </span>
                      <span className="font-extrabold text-slate-800">
                        {item.value} predictions
                      </span>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{
                          width: `${Math.min(
                            (item.value / 45) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Recent validation */}
            <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col justify-between gap-2 border-b border-slate-200 p-6 sm:flex-row sm:items-center">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Recent Validation
                  </h3>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    Sample prediction vs actual arrival records
                  </p>
                </div>

                <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                  Train 12919
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left">
                  <thead className="bg-slate-50">
                    <tr className="text-xs font-extrabold uppercase tracking-wide text-slate-400">
                      <th className="px-6 py-3">Train</th>
                      <th className="px-6 py-3">Station</th>
                      <th className="px-6 py-3">Predicted</th>
                      <th className="px-6 py-3">Actual</th>
                      <th className="px-6 py-3">Error</th>
                      <th className="px-6 py-3">Validation</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {RECENT_VALIDATIONS.map((row, index) => (
                      <tr
                        key={`${row.train}-${row.station}-${index}`}
                        className="text-sm transition hover:bg-slate-50"
                      >
                        <td className="px-6 py-4 font-extrabold text-slate-800">
                          {row.train}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-600">
                          {row.station}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-700">
                          {row.predicted}
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-700">
                          {row.actual}
                        </td>
                        <td className="px-6 py-4 font-extrabold text-slate-800">
                          {row.error}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={row.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : (
          /* Validation tab */
          <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-6">
              <h3 className="text-base font-extrabold text-slate-900">
                Validation Records
              </h3>
              <p className="mt-1 text-xs font-medium text-slate-500">
                Demonstration records showing how predicted arrivals are
                validated against actual arrivals.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left">
                <thead className="bg-slate-50">
                  <tr className="text-xs font-extrabold uppercase tracking-wide text-slate-400">
                    <th className="px-6 py-3">Train</th>
                    <th className="px-6 py-3">Next Station</th>
                    <th className="px-6 py-3">Predicted Arrival</th>
                    <th className="px-6 py-3">Actual Arrival</th>
                    <th className="px-6 py-3">Absolute Error</th>
                    <th className="px-6 py-3">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {RECENT_VALIDATIONS.map((row, index) => (
                    <tr
                      key={`${row.station}-${index}`}
                      className="text-sm hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 font-extrabold text-slate-800">
                        {row.train}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-600">
                        {row.station}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-700">
                        {row.predicted}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-700">
                        {row.actual}
                      </td>
                      <td className="px-6 py-4 font-extrabold text-slate-800">
                        {row.error.replace("-", "").replace("+", "")}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={row.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Methodology / demo notice */}
        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Info size={19} />
              </div>

              <div>
                <h3 className="font-extrabold text-slate-900">
                  Evaluation Method
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Each validated prediction is compared with the corresponding
                  actual arrival time. MAE measures average absolute deviation,
                  while RMSE gives greater weight to larger prediction errors.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600">
                <BarChart3 size={19} />
              </div>

              <div>
                <h3 className="font-extrabold text-blue-900">
                  Demonstration Data
                </h3>
                <p className="mt-2 text-sm leading-6 text-blue-800/70">
                  The values shown on this screen are static prototype
                  evaluation values for demonstration. They are not presented
                  as live railway performance statistics.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="pb-8 pt-6 text-center text-xs font-medium text-slate-400">
          Dynamic Train ETA • AI-based arrival prediction • Prototype
          Evaluation
        </footer>
      </main>
    </div>
  );
}

export default BenchmarkingDemo;
