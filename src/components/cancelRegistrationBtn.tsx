"use client";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cancelRegistration } from "@/actions/actions";
import { toast } from "sonner";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { IsPlaying, LatestGame } from "@/types/user";

export function CancelRegistrationBtn({
  setChange,
  latestGame,
  isActive,
}: {
  isActive: IsPlaying;
  setChange: React.Dispatch<React.SetStateAction<boolean>>;
  latestGame: LatestGame;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useKindeBrowserClient();

  if (!user || !latestGame) return null;
  const handleClick = () => {
    setIsLoading(true);

    const registration = async () => {
      try {
        const registrationResult = await cancelRegistration({
          userId: user.id,
          gameId: latestGame.id,
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
        className={`w-full rounded-md px-2 py-1 animate-in ${isLoading && "border"}`}
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
