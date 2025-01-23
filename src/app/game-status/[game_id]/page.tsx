import { redirect } from "next/navigation";
import { getGameById } from "@/actions/actions";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { getGameByIdAndLocation } from "@/actions/gameActions";
import NextGameCountdown from "@/components/nextGameCountdown";
import PlayersList from "@/components/playersList";
export default async function DynamicGameStatusPage({
  params,
  // searchParams,
}: {
  params: Promise<{ game_id: string }>;
  // searchParams: { [key: string]: string };
}) {
  const { isAuthenticated } = getKindeServerSession();
  if (!isAuthenticated) {
    redirect("/api/auth/login");
  }
  const gameId = (await params).game_id;

  const { success, gameWithPLayers } = await getGameByIdAndLocation(
    Number(gameId),
    1,
  );

  // console.log(success, gameWithPLayers);

  // const { success, game } = await getGameById(Number(gameId));
  // console.log(game, success);
  if (!success) return <p className="mt-28 text-center">No game found</p>;

  return (
    <>
      <h1 className="mb-2 text-center text-3xl font-bold">Game Status</h1>
      <NextGameCountdown gameDate={gameWithPLayers?.game.game_date} />

      <div className="flex flex-col text-center xs:flex-row xs:gap-2">
        <h3 className="mt-4 text-lg font-bold">
          {gameWithPLayers?.game?.game_date
            .toLocaleString("lt-LT", {
              hour: "2-digit",
              minute: "2-digit",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              // hour12: false,
            })
            .toString()}
        </h3>
        {/* <h3 className="text-center text-lg xs:my-4">
                  {latestGameWithPLayers?.participants.length === 0
                    ? "No active players"
                    : "Active players:"}
                </h3> */}
      </div>
      {/* <PlayersList
        latestGameWithPLayers={gameWithPLayers}
      /> */}
    </>
  );
}
