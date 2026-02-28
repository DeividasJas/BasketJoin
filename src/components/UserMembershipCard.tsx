"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { formatCurrency } from "@/lib/paymentUtils";
import { toast } from "sonner";
import { cancelMembership } from "@/actions/leagueMembershipActions";
import { useRouter } from "next/navigation";

type UserMembershipCardProps = {
  membership: {
    id: string;
    status: string;
    joined_at: Date;
    pro_rated_amount: number;
    league: {
      id: string;
      name: string;
      status: string;
      start_date: Date;
      end_date: Date;
    };
    payment_schedules: Array<{
      id: string;
      due_date: Date;
      amount_due: number;
      amount_paid: number;
      status: string;
    }>;
  };
};

function StatusBadge({
  label,
  variant,
}: {
  label: string;
  variant: "green" | "blue" | "yellow" | "red" | "zinc";
}) {
  const colors = {
    green:
      "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    blue: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    yellow:
      "bg-amber-500/10 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
    red: "bg-red-500/10 text-red-600 dark:bg-red-500/10 dark:text-red-400",
    zinc: "bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${colors[variant]}`}
    >
      {label}
    </span>
  );
}

function getStatusVariant(
  status: string,
): "green" | "blue" | "yellow" | "red" | "zinc" {
  switch (status) {
    case "ACTIVE":
      return "green";
    case "UPCOMING":
      return "blue";
    case "PENDING_PAYMENT":
      return "yellow";
    case "CANCELLED":
      return "red";
    default:
      return "zinc";
  }
}

export default function UserMembershipCard({
  membership,
}: UserMembershipCardProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const getPaymentStatus = () => {
    const totalDue = membership.payment_schedules.reduce(
      (sum, s) => sum + s.amount_due,
      0,
    );
    const totalPaid = membership.payment_schedules.reduce(
      (sum, s) => sum + s.amount_paid,
      0,
    );
    const percentage = totalDue > 0 ? (totalPaid / totalDue) * 100 : 0;

    if (percentage === 100) {
      return {
        icon: CheckCircle,
        color: "text-emerald-500",
        text: "Paid in full",
        percentage,
      };
    }
    if (percentage > 0) {
      return {
        icon: Clock,
        color: "text-amber-500",
        text: `${percentage.toFixed(0)}% paid`,
        percentage,
      };
    }

    const hasOverdue = membership.payment_schedules.some(
      (s) => s.status === "OVERDUE" || s.status === "PENDING",
    );
    if (hasOverdue) {
      return {
        icon: AlertCircle,
        color: "text-red-500",
        text: "Payment pending",
        percentage,
      };
    }

    return {
      icon: Clock,
      color: "text-zinc-400",
      text: "Not yet due",
      percentage,
    };
  };

  const paymentStatus = getPaymentStatus();
  const PaymentIcon = paymentStatus.icon;

  const paidSchedules = membership.payment_schedules.filter(
    (s) => s.status === "PAID",
  ).length;

  const canCancel =
    membership.status === "ACTIVE" &&
    membership.payment_schedules.every((s) => s.status !== "PAID");

  const handleCancel = async () => {
    const reason = prompt("Reason for cancelling membership (optional):");
    if (reason === null) return;

    setLoading(true);
    const result = await cancelMembership(membership.id, reason || undefined);
    setLoading(false);

    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-700/60 dark:bg-zinc-800/50">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <Link
          href={`/leagues/${membership.league.id}`}
          className="text-sm font-medium text-zinc-800 transition-colors hover:text-basket-400 dark:text-zinc-100 dark:hover:text-basket-400"
        >
          {membership.league.name}
        </Link>
        <div className="flex gap-1.5">
          <StatusBadge
            label={membership.league.status}
            variant={getStatusVariant(membership.league.status)}
          />
          <StatusBadge
            label={membership.status}
            variant={getStatusVariant(membership.status)}
          />
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-col gap-2.5 text-[13px]">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
            <Calendar className="h-3.5 w-3.5" />
            Season
          </span>
          <span className="text-zinc-600 dark:text-zinc-300">
            {new Date(membership.league.start_date).toLocaleDateString()} –{" "}
            {new Date(membership.league.end_date).toLocaleDateString()}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
            <DollarSign className="h-3.5 w-3.5" />
            Fee
          </span>
          <span className="tabular-nums text-zinc-600 dark:text-zinc-300">
            {formatCurrency(membership.pro_rated_amount)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-zinc-400 dark:text-zinc-500">
            <PaymentIcon className={`h-3.5 w-3.5 ${paymentStatus.color}`} />
            Payment
          </span>
          <span className={`font-medium ${paymentStatus.color}`}>
            {paymentStatus.text}
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500">
          <span>Installments</span>
          <span className="tabular-nums">
            {paidSchedules} / {membership.payment_schedules.length} paid
          </span>
        </div>

        {/* Payment progress bar */}
        {paymentStatus.percentage > 0 && paymentStatus.percentage < 100 && (
          <div className="pt-1">
            <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
              <div
                className="h-full rounded-full bg-basket-400 transition-all"
                style={{ width: `${paymentStatus.percentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-3 dark:border-zinc-700/60">
        <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
          Joined {new Date(membership.joined_at).toLocaleDateString()}
        </span>
        <div className="flex gap-2">
          <Link href={`/leagues/${membership.league.id}`}>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-[12px] text-zinc-500 hover:text-basket-400 dark:text-zinc-400"
            >
              View
            </Button>
          </Link>
          {canCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={loading}
              isLoading={loading}
              className="h-7 text-[12px] text-red-500 hover:bg-red-500/10 hover:text-red-600"
            >
              <XCircle className="mr-1 h-3 w-3" />
              Cancel
            </Button>
          )}
          {!canCancel && membership.status === "ACTIVE" && (
            <span className="self-center text-[10px] text-zinc-400">
              Payments made
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
