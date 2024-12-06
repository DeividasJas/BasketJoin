import { getAllUserGames, getLastTenGames } from "@/actions/actions";
import Link from "next/link";

// Simulate a delay function
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function ProfileDashboardGameHistoryParallel() {
  // Introduce a 5-second delay
  const userGames = await getAllUserGames();
  const lastTenGames = await getLastTenGames();

  console.log(userGames);
  console.log(lastTenGames);

  await delay(1000);

  if (!userGames.success) return <div>{userGames.message}</div>;
  if (userGames.success)
    return (
      <Link href={"/profile/dashboard/@gameHistory"} className="h-full w-full p-2">
        <h4 className="py-2 text-center text-xl">Last 10 games</h4>
        <ul className="flex flex-wrap items-center justify-center gap-2 text-2xl">
          {lastTenGames.lastTenGames?.map((game, index) => {
            if (userGames.userPlayedGames) {
              const userPlayedGames = userGames.userPlayedGames.find(
                (userGame) => userGame.gameId === game.id,
              );

              return <li key={index}>{userPlayedGames ? "🔥" : "👎🏽"}</li>;
            }
          })}
        </ul>
      </Link>
    );
}
