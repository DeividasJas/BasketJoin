"use client";
import { Button } from "@/components/ui/button";
import RegistrationBtn from "./registrationBtn";
import { CancelRegistrationBtn } from "./cancelRegistrationBtn";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function CalendarModal({ eventInfo }: any) {
  const gameId = eventInfo.event._def.extendedProps.game_id;
  const isPlaying = eventInfo.event._def.extendedProps.isActive;
  const startTime = eventInfo.event.start?.toLocaleString("lt-LT");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="flex h-full w-full cursor-pointer flex-col overflow-hidden rounded px-1.5 py-1 text-left text-xs transition-opacity hover:opacity-80">
          <span className="truncate font-medium">{eventInfo.event.title}</span>
          <span className="text-[10px] opacity-60">{eventInfo.timeText}</span>
        </button>
      </DialogTrigger>

      <DialogContent className="rounded-xl border border-zinc-200 bg-white sm:max-w-[400px] dark:border-zinc-700/60 dark:bg-zinc-900">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-zinc-800 dark:text-zinc-100">
            Game Details
          </DialogTitle>
          <DialogDescription className="flex flex-col gap-1 text-sm text-zinc-500 dark:text-zinc-400">
            <span className="block">{eventInfo.event.title}</span>
            <span className="block tabular-nums">{startTime}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-end gap-2 pt-2">
          <DialogClose asChild>
            <CancelRegistrationBtn gameId={gameId} isActive={isPlaying} />
          </DialogClose>
          <DialogClose asChild>
            <RegistrationBtn gameId={gameId} isActive={isPlaying} />
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
