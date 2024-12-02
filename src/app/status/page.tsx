import { getLatestGame, latestGameAndPlayers } from "@/actions/actions";
import NextGameCountdown from "@/components/nextGameCountdown";
import PlayersList from "@/components/playersList";

export default async function Status() {
  const gameAndPlayers = await latestGameAndPlayers();

  const latestGame = await getLatestGame();
  // console.log("latest game", latestGame );

  return (
    <>
      <div className="mx-auto mt-10 flex max-w-[900px] flex-col place-items-center rounded-md bg-zinc-900 px-2 py-6">
        <h1 className="mb-2 text-center text-3xl font-bold">Game Status</h1>
        <NextGameCountdown gameDate={latestGame.latestGame?.gameDate}></NextGameCountdown>
        <div className="flex flex-col text-center xs:flex-row xs:gap-2">
          <h3 className="mt-4 text-lg font-bold">
            {gameAndPlayers?.latestGame?.gameDate
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
          <h3 className="text-center text-lg xs:my-4">Active players:</h3>
        </div>
        <PlayersList gameAndPlayers={gameAndPlayers} />
      </div>
    </>
  );
}
