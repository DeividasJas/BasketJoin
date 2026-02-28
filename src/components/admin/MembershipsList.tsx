"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, Mail, Calendar, DollarSign, CheckCircle, Clock, AlertCircle } from "lucide-react";
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "PENDING_PAYMENT":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "EXPIRED":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatus = (schedules: Membership["payment_schedules"]) => {
    const totalDue = schedules.reduce((sum, s) => sum + s.amount_due, 0);
    const totalPaid = schedules.reduce((sum, s) => sum + s.amount_paid, 0);
    const percentage = totalDue > 0 ? (totalPaid / totalDue) * 100 : 0;

    if (percentage === 100) {
      return { icon: CheckCircle, color: "text-green-500", text: "Paid in full" };
    }
    if (percentage > 0) {
      return {
        icon: Clock,
        color: "text-yellow-500",
        text: `${percentage.toFixed(0)}% paid`,
      };
    }

    const hasOverdue = schedules.some(
      (s) => s.status === "OVERDUE" || s.status === "PENDING",
    );
    if (hasOverdue) {
      return {
        icon: AlertCircle,
        color: "text-red-500",
        text: "Payment pending",
      };
    }

    return { icon: Clock, color: "text-gray-500", text: "Not yet due" };
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Members ({memberships.length})</h2>
        <input
          type="text"
          placeholder="Search members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-64 rounded-md border border-gray-300 px-4 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
        />
      </div>

      {filteredMemberships.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {searchTerm ? "No members found" : "No members yet"}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Pro-Rated Fee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Payment Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
              {filteredMemberships.map((membership) => {
                const paymentStatus = getPaymentStatus(
                  membership.payment_schedules,
                );
                const StatusIcon = paymentStatus.icon;

                return (
                  <tr
                    key={membership.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200">
                          {membership.user.given_name?.[0]}
                          {membership.user.family_name?.[0]}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium">
                            {membership.user.given_name}{" "}
                            {membership.user.family_name}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Mail className="mr-1 h-3 w-3" />
                            {membership.user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center text-sm text-gray-900 dark:text-gray-100">
                        <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                        {new Date(membership.joined_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(membership.status)}`}
                      >
                        {membership.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center text-sm font-medium">
                        <DollarSign className="mr-1 h-4 w-4 text-gray-400" />
                        {formatCurrency(membership.pro_rated_amount)}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div
                        className={`flex items-center text-sm ${paymentStatus.color}`}
                      >
                        <StatusIcon className="mr-2 h-4 w-4" />
                        {paymentStatus.text}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
