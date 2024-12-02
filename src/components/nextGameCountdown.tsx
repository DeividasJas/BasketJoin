"use client";
import { useState, useEffect } from "react";
import Countdown from "react-countdown";
import { CountdownRendererProps } from "@/types/gameTimeTypes";
import CountdownItem from "./countdownItem";
import { getLatestGame } from "@/actions/actions";

export default function NextGameCountdown({
  gameDate,
  children = undefined,
}: {
  gameDate?: Date;
  children?: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  const [countdownKey, setCountdownKey] = useState<string>("");

  const handleCountdownComplete = () => {
    // Update dates and reset countdown key to force re-render
    setCountdownKey("");
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
      <div className="mx-auto grid w-fit grid-cols-2 place-items-center gap-2 text-sm xs:grid-cols-4">
        <CountdownItem time={days} period={"Day"} />
        <CountdownItem time={hours} period={"Hour"} />
        <CountdownItem time={minutes} period={"Minute"} />
        <CountdownItem time={seconds} period={"Second"} />
      </div>
    );
  };

  return (
    <>
      <Countdown
        key={countdownKey}
        date={gameDate}
        zeroPadTime={2}
        onComplete={handleCountdownComplete}
        renderer={renderer}
      />

      {children}
    </>
  );
}
