"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { registerToGame } from "@/actions/gameActions";
import { IsActivePlayer } from "@/types/prismaTypes";
import { redirect, usePathname } from "next/navigation";

export default function RegistrationBtn({
  gameId,
  isActive,
  setChange = () => {},
  props,
  disabled,
  // onClick = () => {},
}: {
  gameId: number;
  isActive: IsActivePlayer;
  setChange?: React.Dispatch<React.SetStateAction<boolean>>;
  props?: string;
  disabled?: boolean;
  // onClick?: () => void;
}) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const pathname = usePathname();


  const handleClick = async () => {
    try {
      setIsLoading((prev) => !prev);
      const { success, message } = await registerToGame(gameId);

      if (!success) {toast.error(message);return;}

      toast.success(message);

      if (pathname !== `/game-status/${gameId}`) {
        setTimeout(() => {
          redirect(`/game-status/${gameId}`);
        }, 500);
      } else {
        setChange((prev) => !prev);
      }
    } catch (error) {
      console.error(error);
      toast.error("Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      className={`px-2 py-1 text-zinc-100 outline outline-zinc-600 hover:scale-105 ${props}`}
      disabled={isActive || isLoading}
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
