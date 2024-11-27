'use client';
import { useState, useEffect } from 'react';
import Countdown from 'react-countdown';
import { getNextGamesDates } from '@/utils/gameTimeFunctions';
import { CountdownRendererProps } from '@/types/gameTimeTypes';
import CountdownItem from './countdownItem';

export default function NextGameCountdown({
  children = undefined,
}: {
  children?: React.ReactNode;
  
}) {
  const [mounted, setMounted] = useState(false);
  const [dates, setDates] = useState<Date[]>(() => getNextGamesDates());
  const [countdownKey, setCountdownKey] = useState<string>('');

  

  const handleCountdownComplete = () => {
    // Update dates and reset countdown key to force re-render
    setDates(getNextGamesDates());
    setCountdownKey('');
  };
  // Only run after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until client-side
  if (!mounted) {
    return null;
  }

  const renderer = ({
    days,
    hours,
    minutes,
    seconds,
  }: CountdownRendererProps) => {
    return (
      <div className='text-sm grid grid-cols-2 xs:grid-cols-4 gap-2 place-items-center w-fit mx-auto'>
        <CountdownItem time={days} period={'Day'} />
        <CountdownItem time={hours} period={'Hour'} />
        <CountdownItem time={minutes} period={'Minute'} />
        <CountdownItem time={seconds} period={'Second'} />
      </div>
    );
  };
  
  return (
    <>
      <Countdown
        key={countdownKey}
        date={dates[0]}
        zeroPadTime={2}
        onComplete={handleCountdownComplete}
        renderer={renderer}
        />

        {children}
    </>
  );
}
