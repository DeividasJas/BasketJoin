import { Player } from '@/types/user';
import { User } from '@prisma/client';
import Image from 'next/image';

export default function PlayerCard({ player }: { player: User }) {
  // console.log(player);
  
  return (
    <>
      <div className='flex flex-col place-items-center mx-4'>
        {player.picture ? (
          <Image
            src={player.picture}
            width={100}
            height={100}
            alt='Player picture'
            className='rounded-md'
          />
        ) : (
          <Image
            src={'/avatar.svg'}
            width={100}
            height={100}
            alt='Player picture'
          />
        )}
        <h5 className='leading-none mt-2'>
          {player.givenName} {player.familyName}
        </h5>

      </div>
    </>
  );
}
