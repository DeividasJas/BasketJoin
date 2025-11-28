"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cancelRegistration } from "@/actions/gameActions";
import { IsActivePlayer } from "@/types/prismaTypes";
import { useRouter } from "next/navigation";

export function CancelRegistrationBtn({
  gameId,
  isActive,
  setChange = () => {},
  props,
  // onClick = () => {},
}: {
  gameId: number;
  isActive: IsActivePlayer;
  setChange?: React.Dispatch<React.SetStateAction<boolean>>;
  props?: string;
  // onClick?: () => void;
}) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleClick = async () => {
    try {
      setIsLoading(true);
      const { success, message } = await cancelRegistration(gameId);

      if (!success) {
        toast.error(message);
      } else {
        setChange((prev) => !prev);
        toast.success(message);
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        disabled={!isActive || isLoading}
        variant={isLoading ? "default" : "destructive"}
        onClick={handleClick}
        className={`px-2 py-1 animate-in hover:scale-105 ${isLoading && "border"} ${props}`}
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
