'use client';
import { useState, useEffect } from 'react';
import Countdown from 'react-countdown';
import { getNextGamesDates } from '@/utils/gameTimeFunctions';
import { CountdownRendererProps } from '@/types/gameTimeTypes';
import CountdownItem from './countdownItem';

export default function NextGameCountdown() {
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
      <div className='text-sm flex gap-2 justify-center flex-wrap'>
        <CountdownItem time={days} period={'Day'} />
        <CountdownItem time={hours} period={'Hour'} />
        <CountdownItem time={minutes} period={'Minute'} />
        <CountdownItem time={seconds} period={'Second'} />
      </div>
    );
  };

  return (
    <div className=''>
      <h3 className='my-4 text-lg ml-[20px]'>Next game starts in:</h3>
      <Countdown
        key={countdownKey}
        date={dates[0]}
        zeroPadTime={2}
        onComplete={handleCountdownComplete}
        renderer={renderer}
      />
      <h4 className='my-4 text-lg ml-[20px]'>Following games:</h4>
      <ul className='flex flex-col gap-1 ml-2'>
        {dates.slice(1).map((gameDate, index) => (
          <li key={index}>{gameDate.toLocaleString().split(',')[0]}</li>
        ))}
      </ul>
    </div>
  );
}
