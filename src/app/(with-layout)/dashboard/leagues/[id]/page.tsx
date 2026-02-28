import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/utils/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Users,
  DollarSign,
  Edit,
  CheckCircle,
  Clock,
} from "lucide-react";
import { formatCurrency } from "@/lib/paymentUtils";
import LeagueActions from "@/components/admin/LeagueActions";
import MembershipsList from "@/components/admin/MembershipsList";

export default async function LeagueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

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

  const league = await prisma.league.findUnique({
    where: { id },
    include: {
      location: true,
      memberships: {
        include: {
          user: {
            select: {
              id: true,
              given_name: true,
              family_name: true,
              email: true,
            },
          },
          payment_schedules: {
            orderBy: { due_date: "asc" },
          },
          _count: {
            select: {
              payments: true,
            },
          },
        },
        orderBy: { joined_at: "asc" },
      },
      payments: {
        include: {
          user: {
            select: {
              id: true,
              given_name: true,
              family_name: true,
            },
          },
        },
        orderBy: { payment_date: "desc" },
      },
      _count: {
        select: {
          memberships: true,
          payments: true,
          payment_schedules: true,
        },
      },
    },
  });

  if (!league) {
    redirect("/dashboard/leagues");
  }

  const paymentDueDates: string[] = JSON.parse(league.payment_due_dates);

  const getStatusColor = (status: string) => {
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

  // Calculate financial summary
  const totalMembershipFees = league.payments
    .filter((p) => p.payment_type === "MEMBERSHIP_FEE")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalGuestFees = league.payments
    .filter((p) => p.payment_type === "GUEST_FEE")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalCollected = totalMembershipFees + totalGuestFees;
  const expectedFromMembers = league.memberships.reduce(
    (sum, m) => sum + m.pro_rated_amount,
    0,
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{league.name}</h1>
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(league.status)}`}
              >
                {league.status}
              </span>
            </div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {league.location.name}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href={`/dashboard/leagues/${id}/edit`}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
            <LeagueActions leagueId={id} status={league.status} />
          </div>
        </div>
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Members
              </p>
              <p className="mt-2 text-3xl font-bold">
                {league._count.memberships}
              </p>
            </div>
            <Users className="h-10 w-10 text-blue-500" />
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Rental Cost
              </p>
              <p className="mt-2 text-3xl font-bold">
                {formatCurrency(league.gym_rental_cost)}
              </p>
            </div>
            <DollarSign className="h-10 w-10 text-green-500" />
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Fees Collected
              </p>
              <p className="mt-2 text-3xl font-bold">
                {formatCurrency(totalCollected)}
              </p>
            </div>
            <CheckCircle className="h-10 w-10 text-purple-500" />
          </div>
          <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            {formatCurrency(totalMembershipFees)} membership +{" "}
            {formatCurrency(totalGuestFees)} guest
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Guest Fee
              </p>
              <p className="mt-2 text-3xl font-bold">
                {formatCurrency(league.guest_fee_per_game)}
              </p>
            </div>
            <Clock className="h-10 w-10 text-orange-500" />
          </div>
          <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            Per game fee
          </p>
        </div>
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 text-lg font-semibold">Season Details</h2>
          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <Calendar className="mr-2 h-4 w-4 text-gray-500" />
              <span className="font-medium">Start:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                {new Date(league.start_date).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center text-sm">
              <Calendar className="mr-2 h-4 w-4 text-gray-500" />
              <span className="font-medium">End:</span>
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                {new Date(league.end_date).toLocaleDateString()}
              </span>
            </div>
            <div className="mt-4 border-t border-gray-200 pt-3 dark:border-gray-700">
              <p className="mb-2 text-sm font-medium">Expected Revenue</p>
              <p className="text-2xl font-bold">
                {formatCurrency(expectedFromMembers)}
              </p>
              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                {league._count.memberships > 0
                  ? `${formatCurrency(Math.floor(expectedFromMembers / league._count.memberships))} per member average`
                  : "No members yet"}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-4 text-lg font-semibold">Payment Due Dates</h2>
          <div className="space-y-2">
            {paymentDueDates.map((date, index) => {
              const isPast = new Date(date) < new Date();
              return (
                <div
                  key={date}
                  className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-800"
                >
                  <span className="text-sm">
                    Payment #{index + 1}:{" "}
                    {new Date(date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  {isPast ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-blue-500" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <MembershipsList leagueId={id} memberships={league.memberships} />
      </div>
    </div>
  );
}
