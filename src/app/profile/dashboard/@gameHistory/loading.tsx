import { Skeleton } from "@/components/ui/skeleton";

export default function GameHistorySkeleton() {
  return (
    <div className="p-2">
      <Skeleton className="mx-auto mb-2 h-6 w-1/3 bg-zinc-800" />
      <div className="flex flex-wrap items-center justify-center gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
          <Skeleton key={item} className="h-8 w-8 rounded-full bg-zinc-800" />
        ))}
      </div>
    </div>
  );
}
