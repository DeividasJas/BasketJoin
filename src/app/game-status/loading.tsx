import { Skeleton } from "@/components/ui/skeleton";

export default function ScheduleSkeleton() {
  return (
    <div className="mx-auto mt-10 flex max-w-[900px] flex-col place-items-center rounded-md bg-zinc-900 px-2 py-6">
      <h1 className="mb-2 text-center text-3xl font-bold">Game Status</h1>
      {/* <h3 className="my-4 ml-[20px] text-lg">Next game starts in:</h3> */}

      <div className="mx-auto grid w-fit grid-cols-2 place-items-center gap-2 text-sm xs:grid-cols-4">
        <Skeleton className="flex aspect-square min-h-full w-[4.5rem] max-w-24 basis-1 flex-col items-center justify-center rounded-md bg-zinc-700 py-3 sm:w-20" />
        <Skeleton className="flex aspect-square min-h-full w-[4.5rem] max-w-24 basis-1 flex-col items-center justify-center rounded-md bg-zinc-700 py-3 sm:w-20" />
        <Skeleton className="flex aspect-square min-h-full w-[4.5rem] max-w-24 basis-1 flex-col items-center justify-center rounded-md bg-zinc-700 py-3 sm:w-20" />
        <Skeleton className="flex aspect-square min-h-full w-[4.5rem] max-w-24 basis-1 flex-col items-center justify-center rounded-md bg-zinc-700 py-3 sm:w-20" />
      </div>
      <div className="flex flex-col place-items-center text-center xs:flex-row xs:gap-2">
        <Skeleton className="mx-auto mb-2 h-[25px] w-[147.5px] bg-zinc-700" />
        <h3 className="text-center text-lg xs:my-4">Active players:</h3>
      </div>

      <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
        <Skeleton className="h-[100px] w-[100px] bg-zinc-700" />
        <Skeleton className="h-[100px] w-[100px] bg-zinc-700" />
        <Skeleton className="h-[100px] w-[100px] bg-zinc-700" />
      </div>
    </div>
  );
}
