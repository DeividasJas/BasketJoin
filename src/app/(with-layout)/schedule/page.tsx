import { getAllGames, getFirstGameByLocationId } from "@/actions/gameActions";
import { getUserId } from "@/actions/userActions";
import { CancelRegistrationBtn } from "@/components/cancelRegistrationBtn";
import GameCalendar from "@/components/gameCalendar";
import NextGameCountdown from "@/components/nextGameCountdown";
import RegistrationBtn from "@/components/registrationBtn";
import { auth } from "@/auth";

export default async function Schedule() {
  const session = await auth();
  const isLoggedIn = !!session?.user;


  const { success: upcomingGamesSuccess, allGames } = await getAllGames();
  const { success, gameData, isActivePlayer, participantsData } =
    await getFirstGameByLocationId(1);

  const user_id = await getUserId();

  // console.log(isActivePlayer);
  

  if (!gameData || !success)
    return <h1 className="text-center text-3xl font-bold">Unavailable</h1>;
  return (
    <>
      <h1 className="text-center text-3xl font-bold">Schedule</h1>
      <h3 className="my-4 text-center text-lg">Next game starts in:</h3>
      <NextGameCountdown gameDate={gameData?.game_date} />
      <div className="mt-4 flex items-center justify-center gap-2 m-2">
        {isLoggedIn && (
          <>
            {isActivePlayer ? (
              <CancelRegistrationBtn gameId={gameData?.game_id} isActive={isActivePlayer}/>
            ) : (
              <RegistrationBtn  gameId={gameData?.game_id} isActive={isActivePlayer}/>
            )}
          </>
        )}
        {gameData && (
          <p className="text-sm">
            Next game - {participantsData && 12 - participantsData.length} Spots
            Left
          </p>
        )}
      </div>

      {/* <Calendar className="w-full border" /> */}
      {upcomingGamesSuccess && (
        <GameCalendar allGames={allGames} user_id={user_id!} />
      )}
    </>
  );
}
