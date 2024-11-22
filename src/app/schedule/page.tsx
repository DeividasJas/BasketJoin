import NextGameCountdown from '@/components/nextGameCountdown';
import RegistrationBtn from '@/components/registrationBtn';

export default function Schedule() {
  return (
    <div className='bg-zinc-800 px-2 py-6 rounded-md mt-10'>
      <h1 className='text-center text-3xl font-bold'>Schedule</h1>
      <NextGameCountdown />
      <RegistrationBtn/>
    </div>
  );
}
