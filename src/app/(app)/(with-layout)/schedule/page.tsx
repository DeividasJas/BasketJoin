import { getAllGames, getNextUpcomingGame } from "@/actions/gameActions";
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
    await getNextUpcomingGame();

  return (
    <div className="flex flex-col gap-6">
      {/* Next Game Section */}
      {gameData && success ? (
        <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-700/60 dark:bg-zinc-900">
          <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
            Next Game Starts In
          </p>
          <NextGameCountdown gameDate={gameData?.game_date} />
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
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
              <span className="text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                <span className="font-semibold text-zinc-700 dark:text-zinc-200">
                  {12 - participantsData.length}
                </span>{" "}
                spots left
              </span>
            )}
            <Link
              href={`/game-status/${gameData.game_id}`}
              className="text-xs font-medium text-basket-400 transition-colors hover:text-basket-300"
            >
              View Details
            </Link>
          </div>
        </section>
      ) : (
        <section className="rounded-xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-700/60 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No upcoming games scheduled yet.
          </p>
          {session?.user?.role === "ADMIN" ||
          session?.user?.role === "ORGANIZER" ? (
            <Button
              variant="outline"
              asChild
              className="mt-4 border-zinc-200 text-xs dark:border-zinc-700"
            >
              <Link href="/dashboard/locations/new">Create First Game</Link>
            </Button>
          ) : null}
        </section>
      )}

      {/* Calendar Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Available
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Registered
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Cancelled
          </span>
        </div>
      </div>

      {/* Calendar */}
      {upcomingGamesSuccess && allGames && allGames.length > 0 ? (
        <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-700/60 dark:bg-zinc-900">
          <div className="p-3 sm:p-4">
            <GameCalendar allGames={allGames} user_id={user_id || ""} />
          </div>
        </section>
      ) : (
        <section className="rounded-xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-700/60 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No games in the calendar yet.
          </p>
          {session?.user?.role === "ADMIN" ||
          session?.user?.role === "ORGANIZER" ? (
            <Button
              variant="outline"
              asChild
              className="mt-4 border-zinc-200 text-xs dark:border-zinc-700"
            >
              <Link href="/dashboard/locations">Manage Games</Link>
            </Button>
          ) : null}
        </section>
      )}
    </div>
  );
}
