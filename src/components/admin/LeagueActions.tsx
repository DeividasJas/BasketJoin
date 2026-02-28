"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Play, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
  activateLeague,
  completeLeague,
  cancelLeague,
} from "@/actions/leagueActions";

interface LeagueActionsProps {
  leagueId: string;
  status: string;
}

export default function LeagueActions({
  leagueId,
  status,
}: LeagueActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleActivate = async () => {
    if (
      !confirm(
        "Are you sure you want to activate this league? Members will be able to join and payment schedules will be created.",
      )
    ) {
      return;
    }

    setLoading(true);
    const result = await activateLeague(leagueId);
    setLoading(false);

    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.message);
    }
  };

  const handleComplete = async () => {
    if (
      !confirm(
        "Are you sure you want to complete this league? This will calculate and distribute rebates from guest fees to all active members.",
      )
    ) {
      return;
    }

    setLoading(true);
    const result = await completeLeague(leagueId);
    setLoading(false);

    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.message);
    }
  };

  const handleCancel = async () => {
    const reason = prompt("Reason for cancelling this league (optional):");
    if (reason === null) return; // User clicked cancel

    setLoading(true);
    const result = await cancelLeague(leagueId, reason || undefined);
    setLoading(false);

    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="flex gap-2">
      {status === "UPCOMING" && (
        <>
          <Button
            onClick={handleActivate}
            disabled={loading}
            className="h-8 bg-basket-400 text-xs text-white hover:bg-basket-300"
          >
            <Play className="mr-1.5 h-3 w-3" />
            Activate
          </Button>
          <Button
            onClick={handleCancel}
            variant="ghost"
            disabled={loading}
            className="h-8 text-xs text-red-500 hover:bg-red-500/10 hover:text-red-600"
          >
            <XCircle className="mr-1.5 h-3 w-3" />
            Cancel
          </Button>
        </>
      )}

      {status === "ACTIVE" && (
        <>
          <Button
            onClick={handleComplete}
            disabled={loading}
            className="h-8 bg-basket-400 text-xs text-white hover:bg-basket-300"
          >
            <CheckCircle className="mr-1.5 h-3 w-3" />
            Complete
          </Button>
          <Button
            onClick={handleCancel}
            variant="ghost"
            disabled={loading}
            className="h-8 text-xs text-red-500 hover:bg-red-500/10 hover:text-red-600"
          >
            <XCircle className="mr-1.5 h-3 w-3" />
            Cancel
          </Button>
        </>
      )}
    </div>
  );
}
