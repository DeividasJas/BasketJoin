import { Skeleton } from "@/components/ui/skeleton";

export default function ScheduleSkeleton() {
  return (
    <div className="mx-auto max-w-[900px] rounded-md bg-zinc-900 px-2">
      <h1 className="mb-2 text-center text-3xl font-bold">Game Status</h1>
      {/* <h3 className="my-4 ml-[20px] text-lg">Next game starts in:</h3> */}

      <div className="mx-auto grid w-fit grid-cols-2 place-items-center gap-2 text-sm xs:grid-cols-4">
        <Skeleton className="flex aspect-square min-h-full w-[4.5rem] max-w-24 basis-1 flex-col items-center justify-center rounded-md bg-zinc-700 py-3 sm:w-20" />
        <Skeleton className="flex aspect-square min-h-full w-[4.5rem] max-w-24 basis-1 flex-col items-center justify-center rounded-md bg-zinc-700 py-3 sm:w-20" />
        <Skeleton className="flex aspect-square min-h-full w-[4.5rem] max-w-24 basis-1 flex-col items-center justify-center rounded-md bg-zinc-700 py-3 sm:w-20" />
        <Skeleton className="flex aspect-square min-h-full w-[4.5rem] max-w-24 basis-1 flex-col items-center justify-center rounded-md bg-zinc-700 py-3 sm:w-20" />
      </div>

      <Skeleton className="mx-auto my-4 h-[25px] w-[157.5px] bg-zinc-700" />

      {/* <div className="flex justify-center gap-8">
        <Skeleton className="h-[100px] w-[100px] bg-zinc-700" />
        <Skeleton className="h-[100px] w-[100px] bg-zinc-700" />
        <Skeleton className="h-[100px] w-[100px] bg-zinc-700" />
      </div> */}
    </div>
  );
}
