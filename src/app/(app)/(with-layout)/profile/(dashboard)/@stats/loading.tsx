export default function StatsGridLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-4 h-3 w-24 rounded bg-zinc-200 dark:bg-zinc-700" />
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="h-7 w-8 rounded bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-2 w-10 rounded bg-zinc-100 dark:bg-zinc-800" />
          </div>
        ))}
      </div>
    </div>
  )
}
