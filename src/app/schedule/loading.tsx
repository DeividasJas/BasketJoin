import RegistrationBtn from "@/components/registrationBtn";
import { Skeleton } from "@/components/ui/skeleton";

export default function ScheduleSkeleton() {
  return (
    <div className="mx-auto mt-10 max-w-[900px] rounded-md bg-zinc-900 px-2 py-6">
      <h1 className="text-center text-3xl font-bold">Schedule</h1>
      <h3 className="my-4 ml-[20px] text-lg">Next game starts in:</h3>

      <div className="mx-auto grid w-fit grid-cols-2 place-items-center gap-2 text-sm xs:grid-cols-4">
        <Skeleton className="flex aspect-square min-h-full w-[4.5rem] max-w-24 basis-1 flex-col items-center justify-center rounded-md bg-zinc-700 py-3 sm:w-20" />
        <Skeleton className="flex aspect-square min-h-full w-[4.5rem] max-w-24 basis-1 flex-col items-center justify-center rounded-md bg-zinc-700 py-3 sm:w-20" />
        <Skeleton className="flex aspect-square min-h-full w-[4.5rem] max-w-24 basis-1 flex-col items-center justify-center rounded-md bg-zinc-700 py-3 sm:w-20" />
        <Skeleton className="flex aspect-square min-h-full w-[4.5rem] max-w-24 basis-1 flex-col items-center justify-center rounded-md bg-zinc-700 py-3 sm:w-20" />
      </div>
      <div className="ml-[20px] mt-4 flex gap-2">
        <RegistrationBtn />
        <Skeleton className="h-[36px] w-[83px] bg-zinc-700" />
      </div>
      <h4 className="my-4 ml-[20px] text-lg">Following games:</h4>
      <Skeleton className="mt-1 h-10 w-[250px] bg-zinc-700" />
    </div>
  );
}
