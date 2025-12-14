"use client";
import { useState } from "react";
import { toast } from "sonner";
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
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        disabled={!isActive || isLoading}
        variant="destructive"
        isLoading={isLoading}
        onClick={handleClick}
        className={`px-2 py-1 animate-in hover:scale-105 ${props}`}
      >
        Cancel Reservation
      </Button>
    </>
  );
}
