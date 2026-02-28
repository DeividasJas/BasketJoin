"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";
import { joinLeague } from "@/actions/leagueMembershipActions";
import { formatCurrency } from "@/lib/paymentUtils";

interface JoinLeagueButtonProps {
  leagueId: string;
  leagueName: string;
  proRatedAmount: number;
}

export default function JoinLeagueButton({
  leagueId,
  leagueName,
  proRatedAmount,
}: JoinLeagueButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleJoin = async () => {
    const confirmMessage = `Join ${leagueName}?\n\nYour pro-rated membership fee will be ${formatCurrency(proRatedAmount)}.\n\nYou will be automatically registered for all upcoming games in this league.`;

    if (!confirm(confirmMessage)) {
      return;
    }

    setLoading(true);

    const result = await joinLeague(leagueId);

    setLoading(false);

    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <Button
      onClick={handleJoin}
      disabled={loading}
      isLoading={loading}
      size="lg"
      className="w-full sm:w-auto"
    >
      <UserPlus className="mr-2 h-5 w-5" />
      {loading ? "Joining..." : "Join League"}
    </Button>
  );
}
