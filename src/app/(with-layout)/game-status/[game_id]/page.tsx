import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { getGameByIdAndLocation } from "@/actions/gameActions";
import NextGameCountdown from "@/components/nextGameCountdown";
import PlayersList from "@/components/playersList";

export default async function DynamicGameStatusPage({
  params,
}: {
  params: Promise<{ game_id: string }>;
}) {
  const { isAuthenticated } = getKindeServerSession();
  const isLoggedIn = await isAuthenticated();
  
  const gameId = Number((await params).game_id);
  const response = await getGameByIdAndLocation(Number(gameId), 1);

  if (!response.success)
    return <p className="mt-28 text-center">No game found</p>;

  return (
    <>
      <h1 className="mb-2 text-center text-3xl font-bold">Game Status</h1>
      <NextGameCountdown gameDate={response.gameData?.game_date} />
      <h3 className="my-4 text-center text-lg font-bold">
        {response.gameData?.game_date
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
        gameId={gameId}
        isLoggedIn={isLoggedIn}
        // gameData={response.gameData}
        isActivePlayer={response.isActivePlayer}
        participantsData={response.participantsData}
      />
    </>
  );
}
