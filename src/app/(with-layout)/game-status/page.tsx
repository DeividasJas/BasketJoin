import PlayersList from "@/components/playersList";
import { getFirstGameByLocationId } from "@/actions/gameActions";
import NextGameCountdown from "@/components/nextGameCountdown";
import { auth } from "@/auth";

export default async function GameStatusPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;


  const { success, gameData, isActivePlayer, participantsData } =
    await getFirstGameByLocationId(1);

  if (!success || !gameData)
    return <h1 className="mb-2 text-center text-3xl font-bold">Unavailable</h1>;

  return (
    <>
      <h1 className="mb-2 text-center text-3xl font-bold">Game Status</h1>
      <NextGameCountdown gameDate={gameData?.game_date} />
      <h3 className="my-4 text-center text-lg font-bold">
        {gameData?.game_date
          .toLocaleString("lt-LT", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
          .toString()}
      </h3>
      <PlayersList
        gameId={gameData.game_id}
        isLoggedIn={isLoggedIn}
        isActivePlayer={isActivePlayer}
        participantsData={participantsData}
      />
    </>
  );
}
