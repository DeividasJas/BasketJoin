"use client";
import { useState, useEffect } from "react";
import Countdown from "react-countdown";
import { CountdownRendererProps } from "@/types/gameTimeTypes";
import CountdownItem from "./countdownItem";

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
    setCountdownKey("");
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center gap-6 py-4 sm:gap-10">
        {["Days", "Hrs", "Min", "Sec"].map((label) => (
          <div key={label} className="flex flex-col items-center">
            <span className="text-4xl font-extralight tabular-nums tracking-tight text-zinc-300 dark:text-zinc-700 sm:text-5xl">
              --
            </span>
            <span className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
              {label}
            </span>
          </div>
        ))}
      </div>
    );
  }

  const renderer = ({
    days,
    hours,
    minutes,
    seconds,
  }: CountdownRendererProps) => {
    return (
      <div className="flex items-center justify-center gap-6 py-4 sm:gap-10">
        <CountdownItem time={days} period="Days" />
        <span className="mt-[-18px] text-2xl font-extralight text-basket-400/50 sm:text-3xl">
          :
        </span>
        <CountdownItem time={hours} period="Hrs" />
        <span className="mt-[-18px] text-2xl font-extralight text-basket-400/50 sm:text-3xl">
          :
        </span>
        <CountdownItem time={minutes} period="Min" />
        <span className="mt-[-18px] text-2xl font-extralight text-basket-400/50 sm:text-3xl">
          :
        </span>
        <CountdownItem time={seconds} period="Sec" />
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
