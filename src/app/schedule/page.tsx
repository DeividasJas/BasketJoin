import { getLatestGame } from "@/actions/actions";
import NextGameCountdown from "@/components/nextGameCountdown";
import RegistrationBtn from "@/components/registrationBtn";
import { getNextGamesDates } from "@/utils/gameTimeFunctions";

export default async function Schedule() {
  const dates = getNextGamesDates();
  const latestGame = await getLatestGame();
  console.log(latestGame);

  return (
    <div className="mt-10 rounded-md bg-zinc-900 px-2 py-6">
      <h1 className="text-center text-3xl font-bold">Schedule</h1>
      <h3 className="my-4 ml-[20px] text-lg">Next game starts in:</h3>

      <NextGameCountdown gameDate={latestGame.latestGame?.gameDate} />

      <div className="ml-[20px] mt-4 flex place-items-center gap-2">
        <RegistrationBtn />
        {latestGame.success && (
          <p className="text-sm">
            {latestGame.latestGame &&
              12 - latestGame.latestGame?.gameRegistrations.length}{" "}
            Spots Left
          </p>
        )}
      </div>
      <h4 className="my-4 ml-[20px] text-lg">Following games:</h4>
      <ul className="ml-2 flex flex-col gap-1">
        {dates.slice(1).map((gameDate, index) => (
          <li key={index}>{gameDate.toLocaleString().split(",")[0]}</li>
        ))}
      </ul>
    </div>
  );
}
