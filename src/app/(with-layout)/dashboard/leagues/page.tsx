import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/utils/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Users, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/paymentUtils";

export default async function LeaguesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const user = await prisma.users.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "ADMIN" && user?.role !== "ORGANIZER") {
    redirect("/schedule");
  }

  const leagues = await prisma.league.findMany({
    include: {
      location: true,
      _count: {
        select: {
          memberships: true,
          payments: true,
          payment_schedules: true,
          games: true,
        },
      },
    },
    orderBy: { start_date: "desc" },
  });

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leagues Management</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage leagues and payment schedules
          </p>
        </div>
        <Link href="/dashboard/leagues/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New League
          </Button>
        </Link>
      </div>

      {leagues.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium">No leagues yet</h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Get started by creating your first league
          </p>
          <Link href="/dashboard/leagues/new">
            <Button className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Create League
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {leagues.map((league) => {
            const paymentDueDates: string[] = JSON.parse(
              league.payment_due_dates,
            );

            return (
              <Link
                key={league.id}
                href={`/dashboard/leagues/${league.id}`}
                className="group"
              >
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {league.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {league.location.name}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(league.status)}`}
                    >
                      {league.status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <Calendar className="mr-2 h-4 w-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {new Date(league.start_date).toLocaleDateString()} -{" "}
                        {new Date(league.end_date).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center text-sm">
                      <Users className="mr-2 h-4 w-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {league._count.memberships} members
                      </span>
                    </div>

                    <div className="flex items-center text-sm">
                      <DollarSign className="mr-2 h-4 w-4 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400">
                        {formatCurrency(league.gym_rental_cost)} total cost
                      </span>
                    </div>

                    <div className="mt-4 border-t border-gray-200 pt-3 dark:border-gray-700">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{paymentDueDates.length} payment dates</span>
                        <span>
                          {formatCurrency(league.guest_fee_per_game)} guest fee
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
