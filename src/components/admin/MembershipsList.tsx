"use client";

import { useState } from "react";
import { Users, Mail } from "lucide-react";
import { formatCurrency } from "@/lib/paymentUtils";

interface Membership {
  id: string;
  user_id: string;
  status: string;
  joined_at: Date;
  pro_rated_amount: number;
  user: {
    id: string;
    given_name: string | null;
    family_name: string | null;
    email: string | null;
  };
  payment_schedules: Array<{
    id: string;
    due_date: Date;
    amount_due: number;
    amount_paid: number;
    status: string;
  }>;
  _count: {
    payments: number;
  };
}

interface MembershipsListProps {
  leagueId: string;
  memberships: Membership[];
}

const statusStyle: Record<string, string> = {
  ACTIVE:
    "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",
  PENDING_PAYMENT:
    "bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400",
  EXPIRED:
    "bg-zinc-100 text-zinc-500 dark:bg-zinc-500/10 dark:text-zinc-400",
  CANCELLED:
    "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
};

export default function MembershipsList({
  leagueId,
  memberships,
}: MembershipsListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMemberships = memberships.filter((membership) => {
    const fullName =
      `${membership.user.given_name} ${membership.user.family_name}`.toLowerCase();
    const email = membership.user.email?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || email.includes(search);
  });

  const getPaymentStatus = (schedules: Membership["payment_schedules"]) => {
    const totalDue = schedules.reduce((sum, s) => sum + s.amount_due, 0);
    const totalPaid = schedules.reduce((sum, s) => sum + s.amount_paid, 0);
    const percentage = totalDue > 0 ? (totalPaid / totalDue) * 100 : 0;

    if (percentage === 100) {
      return { color: "text-green-500", text: "Paid in full" };
    }
    if (percentage > 0) {
      return {
        color: "text-yellow-500",
        text: `${percentage.toFixed(0)}% paid`,
      };
    }

    const hasOverdue = schedules.some(
      (s) => s.status === "OVERDUE" || s.status === "PENDING",
    );
    if (hasOverdue) {
      return { color: "text-red-500", text: "Payment pending" };
    }

    return { color: "text-zinc-400", text: "Not yet due" };
  };

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500">
          Members ({memberships.length})
        </p>
        <input
          type="text"
          placeholder="Search members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-sm placeholder:text-zinc-400 focus:border-basket-400 focus:outline-none focus:ring-2 focus:ring-basket-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:placeholder:text-zinc-500 sm:w-56"
        />
      </div>

      {filteredMemberships.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 p-8 text-center dark:border-zinc-700">
          <Users className="mx-auto h-8 w-8 text-zinc-300 dark:text-zinc-600" />
          <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-500">
            {searchTerm ? "No members found" : "No members yet"}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredMemberships.map((membership) => {
            const paymentStatus = getPaymentStatus(
              membership.payment_schedules,
            );

            return (
              <div
                key={membership.id}
                className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700/60 dark:bg-zinc-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-basket-400/10 text-xs font-semibold text-basket-400">
                      {membership.user.given_name?.[0]}
                      {membership.user.family_name?.[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                        {membership.user.given_name}{" "}
                        {membership.user.family_name}
                      </p>
                      <p className="flex items-center gap-1 truncate text-xs text-zinc-400 dark:text-zinc-500">
                        <Mail className="h-3 w-3 shrink-0" />
                        {membership.user.email}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusStyle[membership.status] || "bg-zinc-100 text-zinc-500"}`}
                  >
                    {membership.status.replace("_", " ")}
                  </span>
                </div>

                <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 border-t border-zinc-100 pt-2.5 text-[11px] tabular-nums text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
                  <span>
                    Joined{" "}
                    {new Date(membership.joined_at).toLocaleDateString()}
                  </span>
                  <span>Fee: {formatCurrency(membership.pro_rated_amount)}</span>
                  <span className={paymentStatus.color}>
                    {paymentStatus.text}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
