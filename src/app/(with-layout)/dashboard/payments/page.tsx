import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/utils/prisma";
import { formatCurrency } from "@/lib/paymentUtils";
import {
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import PaymentSchedulesTable from "@/components/admin/PaymentSchedulesTable";

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  const params = await searchParams;

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const user = await prisma.users.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") {
    redirect("/schedule");
  }

  const statusFilter = params.status as
    | "PENDING"
    | "PAID"
    | "OVERDUE"
    | "PARTIALLY_PAID"
    | undefined;

  // Get all active/upcoming leagues
  const activeLeagues = await prisma.league.findMany({
    where: {
      status: { in: ["ACTIVE", "UPCOMING"] },
    },
    select: {
      id: true,
      name: true,
    },
  });

  // Get payment schedules with filters
  const paymentSchedules = await prisma.paymentSchedule.findMany({
    where: statusFilter
      ? {
          status: statusFilter,
          league: {
            status: { in: ["ACTIVE", "UPCOMING"] },
          },
        }
      : {
          league: {
            status: { in: ["ACTIVE", "UPCOMING"] },
          },
        },
    include: {
      league: true,
      membership: {
        include: {
          user: {
            select: {
              id: true,
              given_name: true,
              family_name: true,
              email: true,
            },
          },
        },
      },
      payments: {
        orderBy: { payment_date: "desc" },
      },
    },
    orderBy: { due_date: "asc" },
  });

  // Calculate summary stats
  const totalDue = paymentSchedules.reduce((sum, s) => sum + s.amount_due, 0);
  const totalPaid = paymentSchedules.reduce((sum, s) => sum + s.amount_paid, 0);
  const totalPending = totalDue - totalPaid;

  const paidCount = paymentSchedules.filter((s) => s.status === "PAID").length;
  const pendingCount = paymentSchedules.filter(
    (s) => s.status === "PENDING",
  ).length;
  const overdueCount = paymentSchedules.filter(
    (s) => s.status === "OVERDUE",
  ).length;

  // Upcoming payments (next 30 days)
  const today = new Date();
  const thirtyDaysFromNow = new Date(today);
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const upcomingPayments = paymentSchedules.filter((s) => {
    const dueDate = new Date(s.due_date);
    return (
      dueDate >= today &&
      dueDate <= thirtyDaysFromNow &&
      (s.status === "PENDING" || s.status === "PARTIALLY_PAID")
    );
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Payment Management</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Track membership payments and schedules
        </p>
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Expected
              </p>
              <p className="mt-2 text-3xl font-bold">
                {formatCurrency(totalDue)}
              </p>
            </div>
            <DollarSign className="h-10 w-10 text-blue-500" />
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Collected
              </p>
              <p className="mt-2 text-3xl font-bold">
                {formatCurrency(totalPaid)}
              </p>
            </div>
            <TrendingUp className="h-10 w-10 text-green-500" />
          </div>
          <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            {totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0}% of
            expected
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Remaining
              </p>
              <p className="mt-2 text-3xl font-bold">
                {formatCurrency(totalPending)}
              </p>
            </div>
            <Clock className="h-10 w-10 text-orange-500" />
          </div>
          <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            {pendingCount} pending installments
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Overdue
              </p>
              <p className="mt-2 text-3xl font-bold text-red-600">
                {overdueCount}
              </p>
            </div>
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>
          <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            Require immediate attention
          </p>
        </div>
      </div>

      {upcomingPayments.length > 0 && (
        <div className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-950">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
              Upcoming Payments (Next 30 Days)
            </h2>
          </div>
          <p className="mt-2 text-sm text-blue-800 dark:text-blue-200">
            {upcomingPayments.length} payment
            {upcomingPayments.length !== 1 ? "s" : ""} due totaling{" "}
            {formatCurrency(
              upcomingPayments.reduce(
                (sum, p) => sum + (p.amount_due - p.amount_paid),
                0,
              ),
            )}
          </p>
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <PaymentSchedulesTable
          schedules={paymentSchedules}
          currentStatus={statusFilter}
        />
      </div>
    </div>
  );
}
