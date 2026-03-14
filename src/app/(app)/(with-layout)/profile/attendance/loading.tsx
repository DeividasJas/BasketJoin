export default function AttendanceLoading() {
  return (
    <div className="flex animate-pulse flex-col gap-8">
      <div className="h-3 w-20 rounded bg-zinc-200 dark:bg-zinc-700" />
      <div>
        <div className="mb-3 flex items-baseline justify-between">
          <div className="h-4 w-40 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-3 w-20 rounded bg-zinc-100 dark:bg-zinc-800" />
        </div>
        <div className="mb-4 h-1.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-700/60" />
        <div className="flex flex-col gap-1.5">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5">
              <div className="h-6 w-6 rounded-full bg-zinc-200 dark:bg-zinc-700" />
              <div className="flex-1">
                <div className="h-3.5 w-32 rounded bg-zinc-200 dark:bg-zinc-700" />
                <div className="mt-1 h-2.5 w-40 rounded bg-zinc-100 dark:bg-zinc-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
