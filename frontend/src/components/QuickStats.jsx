import {
  TrainFront,
  Clock3,
  MapPin,
  Users,
} from "lucide-react";

const stats = [
  {
    icon: TrainFront,
    value: "12,845",
    label: "Total Trains (Daily)",
  },
  {
    icon: Clock3,
    value: "98%",
    label: "On-time Performance",
  },
  {
    icon: MapPin,
    value: "7,523",
    label: "Stations",
  },
  {
    icon: Users,
    value: "24/7",
    label: "Live Monitoring",
  },
];

export default function QuickStats() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-3">

      <h2 className="mb-3 text-sm font-bold text-blue-950">
        Quick Stats
      </h2>


      <div className="grid grid-cols-2 gap-2">

        {stats.map((stat, index) => {

          const Icon = stat.icon;

          return (

            <div
              key={index}
              className="flex min-h-[58px] items-center gap-3 rounded-lg border border-slate-200 p-2"
            >

              <Icon
                size={21}
                className="text-blue-600"
              />

              <div className="flex flex-col gap-1">

                <strong className="text-sm text-blue-950">
                  {stat.value}
                </strong>

                <span className="text-[8px] text-slate-500">
                  {stat.label}
                </span>

              </div>

            </div>

          );
        })}

      </div>

    </section>
  );
}