import { getAllGames, getFirstGameByLocationId } from "@/actions/gameActions";
import { getUserId } from "@/actions/userActions";
import { CancelRegistrationBtn } from "@/components/cancelRegistrationBtn";
import GameCalendar from "@/components/gameCalendar";
import NextGameCountdown from "@/components/nextGameCountdown";
import RegistrationBtn from "@/components/registrationBtn";
import { auth } from "@/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function Schedule() {
  const session = await auth();
  const isLoggedIn = !!session?.user;
  const user_id = await getUserId();

  const { success: upcomingGamesSuccess, allGames } = await getAllGames();
  const { success, gameData, isActivePlayer, participantsData } =
    await getFirstGameByLocationId(1);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <h1 className="mb-6 text-center text-3xl font-bold">Game Schedule</h1>

      {/* Next Game Section */}
      {gameData && success ? (
        <div className="mb-8 rounded-lg bg-zinc-100 p-6 dark:bg-zinc-800">
          <h3 className="mb-2 text-center text-lg font-semibold">
            Next Game Starts In:
          </h3>
          <NextGameCountdown gameDate={gameData?.game_date} />
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
            {isLoggedIn && (
              <>
                {isActivePlayer ? (
                  <CancelRegistrationBtn
                    gameId={gameData?.game_id}
                    isActive={isActivePlayer}
                  />
                ) : (
                  <RegistrationBtn
                    gameId={gameData?.game_id}
                    isActive={isActivePlayer}
                  />
                )}
              </>
            )}
            {gameData && participantsData && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold">
                  {12 - participantsData.length}
                </span>{" "}
                spots left
              </p>
            )}
            <Link
              href={`/game-status/${gameData.game_id}`}
              className="text-sm text-zinc-700 hover:underline dark:text-zinc-300"
            >
              View Details
            </Link>
          </div>
        </div>
      ) : (
        <div className="mb-8 rounded-lg bg-zinc-100 p-6 text-center dark:bg-zinc-800">
          <p className="text-gray-600 dark:text-gray-400">
            No upcoming games scheduled yet.
          </p>
          {session?.user?.role === "ADMIN" ||
          session?.user?.role === "ORGANIZER" ? (
            <Button variant="outline" asChild className="mt-4">
              <Link href="/dashboard/locations/new">Create First Game</Link>
            </Button>
          ) : null}
        </div>
      )}

      {/* Calendar Legend */}
      <div className="mb-4 flex flex-wrap justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-blue-500"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-green-600"></div>
          <span>You're Registered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-red-600"></div>
          <span>Cancelled</span>
        </div>
      </div>

      {/* Calendar */}
      {upcomingGamesSuccess && allGames && allGames.length > 0 ? (
        <div className="rounded-lg bg-white p-4 shadow-md dark:bg-zinc-900">
          <GameCalendar allGames={allGames} user_id={user_id || ""} />
        </div>
      ) : (
        <div className="rounded-lg bg-white p-8 text-center shadow-md dark:bg-zinc-900">
          <p className="mb-4 text-gray-500 dark:text-gray-400">
            No games in the calendar yet.
          </p>
          {session?.user?.role === "ADMIN" ||
          session?.user?.role === "ORGANIZER" ? (
            <Button variant="outline" asChild>
              <Link href="/dashboard/locations">Manage Games</Link>
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}
