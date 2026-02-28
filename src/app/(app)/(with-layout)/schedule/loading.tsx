import { Skeleton } from "@/components/ui/skeleton";

export default function ScheduleSkeleton() {
  return (
    <div className="mx-auto max-w-[900px] rounded-md bg-zinc-300 dark:bg-zinc-900 px-2">
      <h1 className="text-center text-3xl font-bold">Schedule</h1>
      <h3 className="my-4 ml-[20px] text-center text-lg">
        Next game starts in:
      </h3>

      <div className="mx-auto grid w-fit grid-cols-2 place-items-center gap-2 text-sm xs:grid-cols-4">
        <Skeleton className="flex aspect-square min-h-full w-[4.5rem] max-w-24 basis-1 flex-col items-center justify-center rounded-md bg-zinc-400 dark:bg-zinc-700 py-3 sm:w-20" />
        <Skeleton className="flex aspect-square min-h-full w-[4.5rem] max-w-24 basis-1 flex-col items-center justify-center rounded-md bg-zinc-400 dark:bg-zinc-700 py-3 sm:w-20" />
        <Skeleton className="flex aspect-square min-h-full w-[4.5rem] max-w-24 basis-1 flex-col items-center justify-center rounded-md bg-zinc-400 dark:bg-zinc-700 py-3 sm:w-20" />
        <Skeleton className="flex aspect-square min-h-full w-[4.5rem] max-w-24 basis-1 flex-col items-center justify-center rounded-md bg-zinc-400 dark:bg-zinc-700 py-3 sm:w-20" />
      </div>
      <div className="ml-[20px] mt-4 flex gap-2">
        <Skeleton className="mx-auto h-[56px] w-[203px] bg-zinc-400 dark:bg-zinc-700" />
      </div>
      <Skeleton className="mt-6 h-[600px] w-full bg-zinc-400 dark:bg-zinc-700" />
    </div>
  );
}
