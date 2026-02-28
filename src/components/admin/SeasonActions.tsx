"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Play, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
  activateSeason,
  completeSeason,
  cancelSeason,
} from "@/actions/seasonActions";

interface SeasonActionsProps {
  seasonId: string;
  status: string;
}

export default function SeasonActions({
  seasonId,
  status,
}: SeasonActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleActivate = async () => {
    if (
      !confirm(
        "Are you sure you want to activate this season? Members will be able to join and payment schedules will be created.",
      )
    ) {
      return;
    }

    setLoading(true);
    const result = await activateSeason(seasonId);
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
        "Are you sure you want to complete this season? This will calculate and distribute rebates from guest fees to all active members.",
      )
    ) {
      return;
    }

    setLoading(true);
    const result = await completeSeason(seasonId);
    setLoading(false);

    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.message);
    }
  };

  const handleCancel = async () => {
    const reason = prompt("Reason for cancelling this season (optional):");
    if (reason === null) return; // User clicked cancel

    setLoading(true);
    const result = await cancelSeason(seasonId, reason || undefined);
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
          <Button onClick={handleActivate} disabled={loading}>
            <Play className="mr-2 h-4 w-4" />
            Activate
          </Button>
          <Button
            onClick={handleCancel}
            variant="destructive"
            disabled={loading}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </>
      )}

      {status === "ACTIVE" && (
        <>
          <Button onClick={handleComplete} disabled={loading}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Complete Season
          </Button>
          <Button
            onClick={handleCancel}
            variant="destructive"
            disabled={loading}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </>
      )}
    </div>
  );
}
