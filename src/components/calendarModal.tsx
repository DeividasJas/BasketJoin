// "use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CalendarModal({ eventInfo }: any) {
  const [name, setName] = useState("Pedro Duarte");
  const [username, setUsername] = useState("@peduarte");

  const game_id = eventInfo.event._def.extendedProps.game_id;
  const startTime = eventInfo.event.start?.toLocaleString("lt-LT");

  console.log(8888, game_id);

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            // variant="default"
            className="m-0 mx-auto flex h-fit w-fit flex-wrap justify-start gap-0 overflow-hidden bg-orange-800 px-1 py-1 hover:bg-orange-900"
          >
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
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={() => console.log({ name, username })}
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
