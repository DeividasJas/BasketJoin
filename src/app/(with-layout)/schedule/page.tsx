import { getAllGames, getFirstGameByLocationId } from "@/actions/gameActions";
import { getUserId } from "@/actions/userActions";
import GameCalendar from "@/components/gameCalendar";
import NextGameCountdown from "@/components/nextGameCountdown";
import RegistrationBtn from "@/components/registrationBtn";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
// import { Calendar } from "@/components/ui/calendar";

export default async function Schedule() {
  const { isAuthenticated } = getKindeServerSession();
  const isLoggedIn = await isAuthenticated();
  if (!isLoggedIn) redirect("/api/auth/login");

  const { success: upcomingGamesSuccess, allGames } = await getAllGames();
  const { success, gameData, isActivePlayer, participantsData } =
    await getFirstGameByLocationId(1);

  const user_id = await getUserId();

  if (!gameData || !success)
    return <h1 className="text-center text-3xl font-bold">Unavailable</h1>;
  return (
    <>
      <h1 className="text-center text-3xl font-bold">Schedule</h1>
      <h3 className="my-4 ml-[20px] text-center text-lg">
        Next game starts in:
      </h3>
      <NextGameCountdown gameDate={gameData?.game_date} />
      <div className="ml-[20px] mt-4 flex items-center justify-center gap-2">
        <RegistrationBtn isActive={isActivePlayer} gameId={gameData?.game_id} />
        {gameData && (
          <p className="text-sm">
            {participantsData && 12 - participantsData.length} Spots Left
          </p>
        )}
      </div>
      <h4 className="my-4 ml-[20px] text-lg">Following games:</h4>
      {/* <Calendar className="w-full border" /> */}
      {upcomingGamesSuccess && (
        <GameCalendar allGames={allGames} user_id={user_id} />
      )}
    </>
  );
}
