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
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button className="m-0 mx-auto flex h-fit w-fit flex-wrap justify-start gap-0 overflow-hidden bg-orange-800 px-1 py-1 hover:bg-orange-900">
            <p>{eventInfo.timeText}</p>
            <p>{eventInfo.event.title}</p>
          </Button>
        </DialogTrigger>

        <DialogContent className="bg-zinc-800 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Game Time!</DialogTitle>
            <DialogDescription>
              Location: {eventInfo.event.title} <br />
              Time: {startTime}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center gap-2 sm:flex-row">
            <DialogClose asChild className="w-full">
              <Button
                className="bg-red-60 w-min border p-0"
                disabled={isPlaying}
                // onClick={(e) => {
                //   // Manually trigger DialogClose
                //   const closeButton = e.currentTarget.closest(
                //     "[data-dialog-close]",
                //   );
                //   if (closeButton) {
                //     closeButton.click();
                //   }
                // }}
              >
                <RegistrationBtn
                  props={"w-[137px]"}
                  gameId={gameId}
                  isActive={isPlaying}
                />
              </Button>
            </DialogClose>

            <DialogClose asChild className="w-min">
              <CancelRegistrationBtn
                props={"w-full"}
                gameId={gameId}
                isActive={isPlaying}
                // onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                //   const closeButton = e.currentTarget.closest(
                //     "[data-dialog-close]",
                //   ) as HTMLElement;
                //   closeButton?.click();
                // }}
              />
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
