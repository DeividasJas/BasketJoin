export default function Loading() {
  return (
    <div className="flex flex-col items-center animate-pulse">
      <div className="mb-4 h-20 w-20 rounded-full bg-zinc-200 dark:bg-zinc-700" />
      <div className="h-5 w-28 rounded bg-zinc-200 dark:bg-zinc-700" />
      <div className="mt-2 h-3 w-40 rounded bg-zinc-100 dark:bg-zinc-800" />
    </div>
  )
}
