'use client';
import { toast } from 'sonner';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import { redirect, usePathname } from 'next/navigation';
import { latestGame } from '@/utils/gameTimeFunctions';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { isPlaying } from '@/types/user';


// import { KindeUser } from '@kinde-oss/kinde-auth-nextjs/types';

export default function RegistrationBtn({
  setChange,
  isActive,
}: {
  isActive: isPlaying;
  setChange: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const pathname = usePathname();

  const { user, isLoading: kindeLoading } = useKindeBrowserClient();

  const handleClick = () => {
    if (kindeLoading || !user) return;

    setIsLoading((prev: boolean) => !prev);

    const fetchUser = async () => {
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user }),
      });

      const userData = await response.json();
    };
    fetchUser();

    const registrationResults = async () => {
      try {
        const response = await fetch('/api/registration', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            // game: await latestGame(),
            user,
          }),
        });

        const registrationData = await response.json();

        if (registrationData.isRegistered) {
          setIsLoading(false);
          toast.success('Registered for a game 🏀');
          if (pathname !== '/status') {
            setTimeout(() => {
              redirect('/status');
            }, 1000);
          } else {
            setChange((prev) => !prev);
          }
          return registrationData;
        }
      } catch (error) {
        console.log(error);
      }
    };
    registrationResults();
  };
  return (
    <>
      <Button
        className=' border-zinc-600 px-2 py-1 rounded-md border-2 w-full xs:w-fit hover:scale-105 animate-in'
        disabled={isActive}
        onClick={handleClick}
      >
        {isLoading ? (
          <>
            <Loader2 className='animate-spin' />
            Please wait
          </>
        ) : (
          <>Join Game</>
        )}
      </Button>
    </>
  );
}
