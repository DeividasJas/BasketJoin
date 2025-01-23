"use client";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { Game } from "@/types/user";
import { cancelRegistration } from "@/actions/gameActions";

export function CancelRegistrationBtn({
  setChange,
  game,
  isActive,
}: {
  isActive: boolean;
  game: Game;

  setChange: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);

    const registration = async () => {
      try {
        const registrationResult = await cancelRegistration({
          gameId: game.game_id,
        });

        if (registrationResult?.success) {
          setChange((prev) => !prev);
          toast("Registration canceled 😭 ❌ 🏀 ", {
            style: {
              maxWidth: "content",
            },
          });
        } else {
          toast.error("Registration not found");
        }
      } catch (error) {
        console.error(error);
        toast.error("An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    registration();
  };

  return (
    <>
      <Button
        disabled={!isActive}
        variant={isLoading ? "default" : "destructive"}
        onClick={handleClick}
        className={`w-full rounded-md px-2 py-1 animate-in ${isLoading && "border"} hover:scale-105`}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" />
            Please wait
          </>
        ) : (
          <>Cancel Reservation</>
        )}
      </Button>
    </>
  );
}
