import { Skeleton } from "@/components/ui/skeleton";

export default function GameHistorySkeleton() {
  return (
    <div className="p-2 w-full">
      <Skeleton className="mx-auto mb-2 h-6 bg-zinc-400 dark:bg-zinc-800" />
      <div className="flex flex-wrap items-center justify-center gap-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
          <Skeleton key={item} className="h-8 w-8 rounded-full bg-zinc-400 dark:bg-zinc-800" />
        ))}
      </div>
    </div>
  );
}
