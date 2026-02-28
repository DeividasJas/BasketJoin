"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
} from "lucide-react";
import { formatCurrency, daysUntilDue } from "@/lib/paymentUtils";
import { recordMembershipPayment } from "@/actions/paymentActions";
import { toast } from "sonner";

interface PaymentSchedule {
  id: string;
  due_date: Date;
  amount_due: number;
  amount_paid: number;
  status: string;
  league: {
    id: string;
    name: string;
  };
  membership: {
    user: {
      id: string;
      given_name: string | null;
      family_name: string | null;
      email: string | null;
    };
  };
  payments: Array<{
    id: string;
    amount: number;
    payment_date: Date;
  }>;
}

interface PaymentSchedulesTableProps {
  schedules: PaymentSchedule[];
  currentStatus?: string;
}

export default function PaymentSchedulesTable({
  schedules,
  currentStatus,
}: PaymentSchedulesTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [recordingPayment, setRecordingPayment] = useState<string | null>(null);

  const filteredSchedules = schedules.filter((schedule) => {
    const fullName =
      `${schedule.membership.user.given_name} ${schedule.membership.user.family_name}`.toLowerCase();
    const email = schedule.membership.user.email?.toLowerCase() || "";
    const leagueName = schedule.league.name.toLowerCase();
    const search = searchTerm.toLowerCase();

    return (
      fullName.includes(search) ||
      email.includes(search) ||
      leagueName.includes(search)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return (
          <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle className="mr-1 h-3 w-3" />
            Paid
          </span>
        );
      case "PARTIALLY_PAID":
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <Clock className="mr-1 h-3 w-3" />
            Partial
          </span>
        );
      case "OVERDUE":
        return (
          <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
            <AlertCircle className="mr-1 h-3 w-3" />
            Overdue
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </span>
        );
      default:
        return <span className="text-xs text-gray-500">{status}</span>;
    }
  };

  const handleRecordPayment = async (
    scheduleId: string,
    remainingAmount: number,
  ) => {
    const amountStr = prompt(
      `Enter payment amount (max €${remainingAmount / 100}):`,
    );
    if (!amountStr) return;

    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Invalid amount");
      return;
    }

    const amountInCents = Math.round(amount * 100);
    if (amountInCents > remainingAmount) {
      toast.error("Amount exceeds remaining balance");
      return;
    }

    setRecordingPayment(scheduleId);

    const result = await recordMembershipPayment({
      paymentScheduleId: scheduleId,
      amount: amountInCents,
    });

    setRecordingPayment(null);

    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.message);
    }
  };

  const updateFilter = (status: string | null) => {
    const params = new URLSearchParams();
    if (status) {
      params.set("status", status);
    }
    router.push(`/dashboard/payments${params.toString() ? `?${params}` : ""}`);
  };

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Payment Schedules ({filteredSchedules.length})
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search members or leagues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-80 rounded-md border border-gray-300 py-2 pl-10 pr-4 text-sm dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            onClick={() => updateFilter(null)}
            variant={!currentStatus ? "default" : "secondary"}
            size="sm"
          >
            All
          </Button>
          {["PENDING", "PARTIALLY_PAID", "OVERDUE", "PAID"].map((status) => (
            <Button
              key={status}
              onClick={() => updateFilter(status)}
              variant={currentStatus === status ? "default" : "secondary"}
              size="sm"
            >
              {status.replace("_", " ")}
            </Button>
          ))}
        </div>
      </div>

      {filteredSchedules.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
          <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {searchTerm
              ? "No matching payment schedules"
              : "No payment schedules found"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  League
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
              {filteredSchedules.map((schedule) => {
                const remainingAmount =
                  schedule.amount_due - schedule.amount_paid;
                const daysUntil = daysUntilDue(schedule.due_date);

                return (
                  <tr
                    key={schedule.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <div>
                        <div className="text-sm font-medium">
                          {schedule.membership.user.given_name}{" "}
                          {schedule.membership.user.family_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {schedule.membership.user.email}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-medium">
                        {schedule.league.name}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm">
                        {new Date(schedule.due_date).toLocaleDateString()}
                      </div>
                      {schedule.status !== "PAID" && (
                        <div
                          className={`text-xs ${daysUntil < 0 ? "text-red-600" : daysUntil < 7 ? "text-orange-600" : "text-gray-500"}`}
                        >
                          {daysUntil < 0
                            ? `${Math.abs(daysUntil)} days overdue`
                            : `${daysUntil} days left`}
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm font-medium">
                        {formatCurrency(schedule.amount_due)}
                      </div>
                      {schedule.amount_paid > 0 && (
                        <div className="text-xs text-green-600">
                          {formatCurrency(schedule.amount_paid)} paid
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {getStatusBadge(schedule.status)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      {schedule.status !== "PAID" && (
                        <Button
                          size="sm"
                          onClick={() =>
                            handleRecordPayment(schedule.id, remainingAmount)
                          }
                          disabled={recordingPayment === schedule.id}
                        >
                          {recordingPayment === schedule.id
                            ? "Recording..."
                            : "Record Payment"}
                        </Button>
                      )}
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
