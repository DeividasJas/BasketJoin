import { getLatestGame } from '@/actions/actions';
import NextGameCountdown from '@/components/nextGameCountdown';
import RegistrationBtn from '@/components/registrationBtn';
import { getNextGamesDates } from '@/utils/gameTimeFunctions';


export default async function Schedule() {
  const dates = getNextGamesDates();
  // console.log(dates);
  const latestGame = await getLatestGame();
  console.log(latestGame);

  return (
    <div className='bg-zinc-800 px-2 py-6 rounded-md mt-10'>
      <h1 className='text-center text-3xl font-bold'>Schedule</h1>
      <h3 className='my-4 text-lg ml-[20px]'>Next game starts in:</h3>
      

      <NextGameCountdown  />

      <div className='flex gap-2 place-items-center ml-[20px] mt-4'>
        <RegistrationBtn />
        {latestGame && (
          <p className='text-sm'>{12 - latestGame?.gameRegistrations.length} Spots Left</p>
        )}
      </div>
      <h4 className='my-4 text-lg ml-[20px]'>Following games:</h4>
      <ul className='flex flex-col gap-1 ml-2'>
        {dates.slice(1).map((gameDate, index) => (
          <li key={index}>{gameDate.toLocaleString().split(',')[0]}</li>
        ))}
      </ul>
    </div>
  );
}
