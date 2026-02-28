import PlayersList from "@/components/playersList";
import { getNextUpcomingGame } from "@/actions/gameActions";
import NextGameCountdown from "@/components/nextGameCountdown";
import { auth } from "@/auth";
import { format } from "date-fns";
import { Calendar, MapPin } from "lucide-react";

export default async function GameStatusPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  const { success, gameData, isActivePlayer, participantsData } =
    await getNextUpcomingGame();

  if (!success || !gameData)
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="mb-3 h-10 w-10 rounded-full bg-zinc-200 dark:bg-zinc-700" />
        <p className="text-sm text-zinc-500">No upcoming games</p>
      </div>
    );

  const maxPlayers = gameData.max_players ?? 12;
  const minPlayers = gameData.min_players ?? 10;

  return (
    <div className="mx-auto max-w-md space-y-6">
      {/* Header */}
      <p className="text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
        Next game in
      </p>

      {/* Countdown */}
      <NextGameCountdown gameDate={gameData.game_date} />

      {/* Divider */}
      <div className="border-t border-zinc-200 dark:border-zinc-700/60" />

      {/* Game info */}
      <div className="flex flex-col gap-2.5">
        {gameData.game_date && (
          <div className="flex items-center gap-2.5">
            <Calendar className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
            <span className="text-sm text-zinc-700 dark:text-zinc-300">
              {format(gameData.game_date, "EEEE, MMM d · h:mm a")}
            </span>
          </div>
        )}
        {gameData.location?.name && (
          <div className="flex items-center gap-2.5">
            <MapPin className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              {gameData.location.name}
            </span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="border-t border-zinc-200 dark:border-zinc-700/60" />

      {/* Players */}
      <PlayersList
        gameId={gameData.game_id}
        isLoggedIn={isLoggedIn}
        isActivePlayer={isActivePlayer}
        participantsData={participantsData}
        maxPlayers={maxPlayers}
        minPlayers={minPlayers}
      />
    </div>
  );
}
