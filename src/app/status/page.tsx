import { getLatestGameByLocation } from "@/actions/actions";
import NextGameCountdown from "@/components/nextGameCountdown";
import PlayersList from "@/components/playersList";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

export default async function Status() {
  const { isAuthenticated, getUser } = getKindeServerSession();
  const kindeUser = await getUser();
  const isAuth = await isAuthenticated();
  if (!isAuth) {
    redirect("/api/auth/login");
  }
  // const delay = (ms: number) =>x
  //   new Promise((resolve) => setTimeout(resolve, ms));
  // await delay(1000);

  // const latestGame = await getLatestGame();
  // console.log("latest game", latestGame );

  const { latestGameWithPLayers } = await getLatestGameByLocation(1);
  console.log(latestGameWithPLayers);

  return (
    <>
      <div className="mx-auto mt-10 flex max-w-[900px] flex-col place-items-center rounded-md bg-zinc-900 px-2 py-6">
        <h1 className="mb-2 text-center text-3xl font-bold">Game Status</h1>
        <NextGameCountdown gameDate={latestGameWithPLayers?.game.game_date} />

        <div className="flex flex-col text-center xs:flex-row xs:gap-2">
          <h3 className="mt-4 text-lg font-bold">
            {latestGameWithPLayers?.game?.game_date
              .toLocaleString("lt-LT", {
                hour: "2-digit",
                minute: "2-digit",
                // second: '2-digit',
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour12: false, // Use 24-hour format
              })
              .toString()}
          </h3>
          {/* <h3 className="text-center text-lg xs:my-4">
            {latestGameWithPLayers?.participants.length === 0
              ? "No active players"
              : "Active players:"}
          </h3> */}
        </div>
        <PlayersList
          latestGameWithPLayers={latestGameWithPLayers}
          kindeUserId={kindeUser.id}
        />
      </div>
    </>
  );
}
