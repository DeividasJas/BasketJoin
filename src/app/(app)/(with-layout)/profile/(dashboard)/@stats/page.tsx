import Link from "next/link";

const stats = [
  { label: "Points", value: 12 },
  { label: "Rebounds", value: 12 },
  { label: "Assists", value: 12 },
  { label: "Steals", value: 12 },
];

export default async function ProfileDashboardStatsParallel() {
  return (
    <div>
      {/* Section header */}
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500 dark:text-zinc-400">
          Season Stats
        </h3>
        <Link
          href="/profile/stats"
          className="text-[11px] text-zinc-400 transition-colors hover:text-basket-400 dark:text-zinc-500"
        >
          View all
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-1">
            <span className="text-2xl font-extralight tabular-nums text-zinc-800 dark:text-zinc-100">
              {stat.value}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
