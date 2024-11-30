import { latestGameAndPlayers } from '@/actions/actions';
import NextGameCountdown from '@/components/nextGameCountdown';
import PlayersList from '@/components/playersList';

export default async function Status() {
  const gameAndPlayers = await latestGameAndPlayers();
  console.log('status page', gameAndPlayers);

  return (
    <>
      <div className='bg-zinc-900 px-2 py-6 rounded-md mt-10 flex flex-col place-items-center max-w-[900px] mx-auto'>
        <h1 className='text-center text-3xl font-bold mb-2'>Game Status</h1>
        <NextGameCountdown></NextGameCountdown>
        <div className='flex flex-col xs:flex-row text-center xs:gap-2'>
          <h3 className='mt-4 font-bold text-lg'>
            {gameAndPlayers?.latestGame?.gameDate
              .toLocaleString('lt-LT', {
                hour: '2-digit',
                minute: '2-digit',
                // second: '2-digit',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour12: false, // Use 24-hour format
              })
              .toString()}
          </h3>
          <h3 className='xs:my-4 text-lg text-center'>Active players:</h3>
        </div>
        <PlayersList gameAndPlayers={gameAndPlayers} />
      </div>
    </>
  );
}
