import Image from "next/image";
import Link from "next/link";

// const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function ProfileDashboardStatsParallel() {
  // await delay(500);
  return (
    <>
      <h4 className="my-2 text-center text-xl">Season Statistics</h4>
      <div className="mx-auto flex max-w-[150px] flex-col gap-2 text-zinc-300 xs:grid xs:max-w-[350px] xs:place-items-center">
        <div className="flex h-fit w-full flex-col items-center justify-center gap-[0.3rem] rounded-md bg-[rgb(159,89,46)] px-2 py-2 hover:bg-[rgb(150,91,54)] xs:w-full xs:min-w-[120px] xs:max-w-[150px]">
          <Image
            src={"/stats-basketball.svg"}
            alt="basketball"
            width={25}
            height={25}
          />
          <p className="leading-none">Points</p>
          <p className="leading-none">{12}</p>
        </div>
        <div className="flex h-fit w-full min-w-max flex-col items-center justify-center gap-[0.3rem] rounded-md bg-[rgb(159,89,46)] px-2 py-2 hover:bg-[rgb(150,91,54)] xs:w-full xs:min-w-[120px] xs:max-w-[150px]">
          <Image src={"/stats-hand.svg"} alt="hand" width={25} height={25} />
          <p className="leading-none">Rebounds</p>
          <p className="leading-none">{12}</p>
        </div>
        <div className="flex h-fit w-full flex-col items-center justify-center gap-[0.3rem] rounded-md bg-[rgb(159,89,46)] px-2 py-2 hover:bg-[rgb(150,91,54)] xs:w-full xs:min-w-[120px] xs:max-w-[150px]">
          <Image
            src={"/stats-assist.svg"}
            alt="assists"
            width={25}
            height={25}
          />

          <p className="leading-none">Assists</p>
          <p className="leading-none">{12}</p>
        </div>
        <div className="flex h-fit w-full flex-col items-center justify-center gap-[0.3rem] rounded-md bg-[rgb(159,89,46)] px-2 py-2 hover:bg-[rgb(150,91,54)] xs:w-full xs:min-w-[120px] xs:max-w-[150px]">
          <Image src={"/stats-hand.svg"} alt="steals" width={25} height={25} />
          <p className="leading-none">Steals</p>
          <p className="leading-none">{12}</p>
        </div>
        <div className="col-span-2 flex place-content-center">
          <Link
            href={"/profile/stats"}
            className="col-span-2 w-1/3 min-w-max whitespace-nowrap rounded-md border-2 border-zinc-600 p-1 text-center hover:border-[rgb(150,91,54)]"
          >
            View More
          </Link>
        </div>
      </div>
    </>
  );
}
