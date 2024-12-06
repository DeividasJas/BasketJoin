import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <>
      <div className="flex h-full w-[400px] gap-3 space-y-3 px-3 py-1">
        <Skeleton className="h-full w-1/2 rounded-xl bg-zinc-800" />
        <div className="w-full space-y-2">
          <Skeleton className="h-4 w-full bg-zinc-800" />
          <Skeleton className="h-6 w-3/4 bg-zinc-800" />
          <Skeleton className="h-5 w-full bg-zinc-800" />
          <Skeleton className="h-4 w-1/3 bg-zinc-800" />
        </div>
      </div>
    </>
  );
}
