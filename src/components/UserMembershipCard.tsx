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
  Eye,
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

export default function UserMembershipCard({
  membership,
}: UserMembershipCardProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const getLeagueStatusColor = (status: string) => {
    switch (status) {
      case "UPCOMING":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "ACTIVE":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "COMPLETED":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getMembershipStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "PENDING_PAYMENT":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "EXPIRED":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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
        color: "text-green-500",
        text: "Paid in full",
        percentage,
      };
    }
    if (percentage > 0) {
      return {
        icon: Clock,
        color: "text-yellow-500",
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
      color: "text-gray-500",
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
    const reason = prompt(
      "Reason for cancelling membership (optional):",
    );
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
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <Link
            href={`/leagues/${membership.league.id}`}
            className="text-lg font-semibold hover:text-orange-600 dark:hover:text-orange-400"
          >
            {membership.league.name}
          </Link>
          <div className="mt-2 flex flex-wrap gap-2">
            <span
              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getLeagueStatusColor(membership.league.status)}`}
            >
              {membership.league.status}
            </span>
            <span
              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getMembershipStatusColor(membership.status)}`}
            >
              {membership.status}
            </span>
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Calendar className="h-4 w-4" />
            <span>Season:</span>
          </div>
          <span className="font-medium">
            {new Date(membership.league.start_date).toLocaleDateString()} -{" "}
            {new Date(membership.league.end_date).toLocaleDateString()}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <DollarSign className="h-4 w-4" />
            <span>Pro-rated fee:</span>
          </div>
          <span className="font-semibold">
            {formatCurrency(membership.pro_rated_amount)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <PaymentIcon className={`h-4 w-4 ${paymentStatus.color}`} />
            <span>Payment status:</span>
          </div>
          <span className={`font-medium ${paymentStatus.color}`}>
            {paymentStatus.text}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Installments:</span>
          <span>
            {paidSchedules} of {membership.payment_schedules.length} paid
          </span>
        </div>

        {/* Payment Progress Bar */}
        {paymentStatus.percentage > 0 && paymentStatus.percentage < 100 && (
          <div className="mt-2">
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-orange-600"
                style={{ width: `${paymentStatus.percentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-200 pt-4 dark:border-gray-700">
        <Link href={`/leagues/${membership.league.id}`}>
          <Button variant="outline" size="sm">
            <Eye className="mr-2 h-4 w-4" />
            View League
          </Button>
        </Link>
        {canCancel && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleCancel}
            disabled={loading}
            isLoading={loading}
          >
            <XCircle className="mr-2 h-4 w-4" />
            Cancel Membership
          </Button>
        )}
        {!canCancel && membership.status === "ACTIVE" && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Cannot cancel: payments have been made
          </p>
        )}
      </div>

      {/* Joined Date */}
      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        Joined {new Date(membership.joined_at).toLocaleDateString()}
      </p>
    </div>
  );
}
