import { Skeleton } from "@/components/ui/skeleton";

export default function StatsGridSkeleton() {
  return (
    <div className="grid h-full w-full grid-cols-2 gap-2 text-zinc-300">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="flex h-fit flex-col items-center justify-center gap-[0.3rem] rounded-md bg-zinc-800 px-2 py-2"
        >
          <Skeleton className="h-[25px] w-[25px] rounded-full" />
          <Skeleton className="mt-1 h-3 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      ))}
      <div className="col-span-2 flex place-content-center">
        <Skeleton className="h-8 w-1/3 rounded-md border-2 border-zinc-600" />
      </div>
    </div>
  );
}
