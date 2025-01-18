import { getAllGames, getLatestGame } from "@/actions/actions";
import GameCalendar from "@/components/gameCalendar";
import NextGameCountdown from "@/components/nextGameCountdown";
import RegistrationBtn from "@/components/registrationBtn";

export default async function Schedule() {
  const { success: latestGameSuccess, latestGame } = await getLatestGame();
  const { success: upcomingGamesSuccess, allGames } = await getAllGames();


  // console.log(latestGame);
  // const delay = (ms: number) =>
  //   new Promise((resolve) => setTimeout(resolve, ms));
  // await delay(10000);
  return (
    <div className="mx-auto mt-10 max-w-[900px] rounded-md bg-zinc-900 px-2 py-6">
      <h1 className="text-center text-3xl font-bold">Schedule</h1>
      <h3 className="my-4 ml-[20px] text-lg">Next game starts in:</h3>

      <NextGameCountdown gameDate={latestGame?.game_date} />
      
      <div className="ml-[20px] mt-4 flex place-items-center gap-2">
        <RegistrationBtn />
        {latestGameSuccess && (
          <p className="text-sm">
            {latestGame &&
              12 - latestGame?.game_registrations.length}{" "}
            Spots Left
          </p>
        )}
      </div>
      <h4 className="my-4 ml-[20px] text-lg">Following games:</h4>
        {upcomingGamesSuccess && <GameCalendar allGames={allGames} />}
      {/* <ul className="ml-2 flex flex-col gap-1">
        {dates.slice(1).map((gameDate, index) => (
          <li key={index}>{gameDate.toLocaleString().split(",")[0]}</li>
        ))}
      </ul> */}
    </div>
  );
}
