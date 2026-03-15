export default function GameHistoryLoading() {
  return (
    <div className="animate-pulse">
      <div className="mb-4 h-3 w-28 rounded bg-zinc-200 dark:bg-zinc-700" />
      <div className="flex items-center gap-2.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-3.5 w-3.5 rounded-full bg-zinc-200 dark:bg-zinc-700" />
        ))}
      </div>
    </div>
  )
}
