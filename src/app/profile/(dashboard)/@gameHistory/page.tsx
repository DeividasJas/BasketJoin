import {lastTenGamesFromUserRegistration} from "@/actions/actions";
import Link from "next/link";
import { Check, Ban } from "lucide-react";


export default async function ProfileDashboardGameHistoryParallel() {
  const { lastTenGames, user,  } = await lastTenGamesFromUserRegistration();
  // console.log(22222, user, lastTenGames);
  // const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  // await delay(1000);
  return (
    <Link href={"/profile/attendance"} className="h-full w-full p-2">
      <h4 className="py-2 text-center text-xl">{lastTenGames?.length === 0 ? 'Have not played yet' : `Last ${lastTenGames?.length} ${lastTenGames?.length === 1 ? 'game' : 'games'}` }</h4>
      <ul className="flex flex-wrap items-center justify-center gap-2 text-2xl">
        {lastTenGames && lastTenGames.map((game) => {
          const wasPlaying = game.game_registrations.find((registration) => registration.user_id === user?.id,)
          return  wasPlaying ? <li><Check/></li> : <li><Ban/></li>
        })}

      </ul>
    </Link>
  );
}
