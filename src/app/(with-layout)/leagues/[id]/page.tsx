import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/utils/prisma";
import JoinLeagueButton from "@/components/JoinLeagueButton";
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  FileText,
  CheckCircle,
} from "lucide-react";
import { formatCurrency, calculateProRatedAmount } from "@/lib/paymentUtils";
import { checkLeagueMembership } from "@/actions/leagueMembershipActions";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function LeagueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const league = await prisma.league.findUnique({
    where: { id },
    include: {
      location: true,
      _count: {
        select: {
          memberships: true,
          games: true,
        },
      },
    },
  });

  if (!league) {
    redirect("/leagues");
  }

  const { isMember, membership } = await checkLeagueMembership(
    session.user.id,
    id,
  );

  // Calculate pro-rated amount for joining today
  const paymentDueDates: string[] = JSON.parse(league.payment_due_dates);
  const proRatedCalculation = calculateProRatedAmount(
    league.gym_rental_cost,
    league.start_date,
    league.end_date,
    new Date(),
    paymentDueDates,
  );

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

  const canJoin = !isMember && (league.status === "ACTIVE" || league.status === "UPCOMING");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{league.name}</h1>
              {league.description && (
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {league.description}
                </p>
              )}
            </div>
            <span
              className={`ml-4 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(league.status)}`}
            >
              {league.status}
            </span>
          </div>
        </div>

        {/* Membership Status or Join Button */}
        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          {isMember ? (
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-semibold text-green-600 dark:text-green-400">
                  You are a member of this league
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Membership status: {membership?.status}
                </p>
              </div>
            </div>
          ) : canJoin ? (
            <div>
              <div className="mb-4">
                <p className="text-lg font-semibold">Join this league</p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Pro-rated membership fee (joining today):{" "}
                  <span className="font-bold text-orange-600 dark:text-orange-400">
                    {formatCurrency(proRatedCalculation.totalAmount)}
                  </span>
                </p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {proRatedCalculation.percentageOfSeason.toFixed(0)}% of the
                  season remaining • {proRatedCalculation.schedules.length}{" "}
                  payment
                  {proRatedCalculation.schedules.length !== 1 ? "s" : ""}
                </p>
              </div>
              <JoinLeagueButton
                leagueId={league.id}
                leagueName={league.name}
                proRatedAmount={proRatedCalculation.totalAmount}
              />
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400">
                This league is not currently accepting new members
              </p>
            </div>
          )}
        </div>

        {/* League Details */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Info */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-lg font-semibold">League Details</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">{league.location.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {league.location.address}, {league.location.city}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="mt-1 h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">Season Dates</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(league.start_date).toLocaleDateString()} -{" "}
                    {new Date(league.end_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="mt-1 h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">Members & Games</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {league._count.memberships} members • {league._count.games}{" "}
                    games
                  </p>
                </div>
              </div>

              {league.game_type && (
                <div className="flex items-start gap-3">
                  <FileText className="mt-1 h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">Game Type</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {league.game_type}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-lg font-semibold">Payment Information</h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Membership Cost
                  </span>
                  <span className="text-lg font-bold">
                    {formatCurrency(league.gym_rental_cost)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Full season • {paymentDueDates.length} installments
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Guest Fee (per game)
                  </span>
                  <span className="font-semibold">
                    {formatCurrency(league.guest_fee_per_game)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  For non-members
                </p>
              </div>

              <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                <p className="text-sm font-medium">Payment Schedule</p>
                <div className="mt-2 space-y-1">
                  {paymentDueDates.slice(0, 3).map((date, index) => (
                    <p
                      key={index}
                      className="text-xs text-gray-600 dark:text-gray-400"
                    >
                      {new Date(date).toLocaleDateString()}
                    </p>
                  ))}
                  {paymentDueDates.length > 3 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      +{paymentDueDates.length - 3} more...
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        {league.game_description && (
          <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-2 text-lg font-semibold">About the Games</h2>
            <p className="text-gray-600 dark:text-gray-400">
              {league.game_description}
            </p>
          </div>
        )}

        {/* Back Button */}
        <div className="mt-8">
          <Link href="/leagues">
            <Button variant="outline">← Back to Leagues</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
