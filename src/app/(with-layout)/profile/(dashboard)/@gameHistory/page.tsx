
import Link from "next/link";
import { Check, Ban } from "lucide-react";
import { lastTenGamesFromUserRegistration } from "@/actions/gameActions";

export default async function ProfileDashboardGameHistoryParallel() {
  const { lastTenGames, user } = await lastTenGamesFromUserRegistration();
  return (
    <Link href={"/profile/attendance"} className="h-full w-full p-2">
      <h4 className="py-2 text-center text-xl">
        {lastTenGames?.length === 0
          ? "Have not played yet"
          : `Last ${lastTenGames?.length} ${lastTenGames?.length === 1 ? "game" : "games"}`}
      </h4>
      <ul className="flex flex-wrap items-center justify-center gap-2 text-2xl">
        {lastTenGames &&
          lastTenGames.map((game, index) => {
            const wasPlaying = game.game_registrations.some(
              (registration) => registration.user_id === user?.id,
            );
            return wasPlaying ? (
              <li key={index}>
                <Check />
              </li>
            ) : (
              <li key={index}>
                <Ban />
              </li>
            );
          })}
      </ul>
    </Link>
  );
}
