import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="h-full w-full">
      <Skeleton className="mx-auto h-[100px] w-[100px] bg-zinc-700"></Skeleton>

      <div className="mt-1 flex flex-col gap-1">
        <Skeleton className="mx-auto h-4 w-20 bg-zinc-700" />
        <Skeleton className="mx-auto h-4 w-20 bg-zinc-700" />
        <Skeleton className="mx-auto h-4 w-20 bg-zinc-700" />
      </div>
    </div>
  );
}
