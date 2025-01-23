"use client";
import { toast } from "sonner";
import { redirect, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { registerToGame } from "@/actions/gameActions";

export default function RegistrationBtn({
  setChange = () => {},
  isActive = false,
  gameId
}: {
  setChange?: React.Dispatch<React.SetStateAction<boolean>>;
  isActive?: boolean;
  gameId: number
}) {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  const handleClick = async () => {
    // if (kindeLoading || !user) return;
    setIsLoading((prev: boolean) => !prev);
    const response = await registerToGame(Number(gameId));

    // console.log("REGISTRATION", response);

    if (!response.success) {
      setIsLoading(false);
      toast.error(response.message);
    } else {
      setIsLoading(false);
      if (pathname !== "/game-status") {
        setTimeout(() => {
          redirect("/status");
        }, 1000);
        toast.success(response.message);
      } else {
        setChange((prev) => !prev);
      }
    }
  };

  return (
    <Button
      // className="w-full rounded-md border-2 border-zinc-600 px-2 py-1 animate-in hover:scale-105 xs:w-fit"
      className="px-2 py-1 text-zinc-100 outline outline-zinc-600 hover:scale-105"
      // variant="default"
      disabled={isActive}
      onClick={handleClick}
    >
      {isLoading ? (
        <>
          <Loader2 className="animate-spin" />
          Please wait
        </>
      ) : (
        <>Join Game</>
      )}
    </Button>
  );
}
