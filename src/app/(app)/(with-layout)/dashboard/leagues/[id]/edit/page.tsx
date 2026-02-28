import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/utils/prisma";
import LeagueForm from "@/components/admin/LeagueForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditLeaguePage({
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
    select: {
      id: true,
      name: true,
      description: true,
      location_id: true,
      start_date: true,
      end_date: true,
      gym_rental_cost: true,
      guest_fee_per_game: true,
      payment_due_dates: true,
      min_players: true,
      max_players: true,
      game_type: true,
      game_description: true,
    },
  });

  if (!league) {
    redirect("/dashboard/leagues");
  }

  const allLocations = await prisma.locations.findMany({
    where: { is_active: true },
    select: {
      id: true,
      name: true,
      address: true,
      city: true,
    },
    orderBy: { name: "asc" },
  });

  const paymentDueDates: string[] = JSON.parse(league.payment_due_dates);

  return (
    <div className="mx-auto w-full max-w-2xl flex flex-col gap-6">
      <Link
        href={`/dashboard/leagues/${league.id}`}
        className="inline-flex items-center gap-1 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
      >
        <ArrowLeft className="h-3 w-3" />
        League Details
      </Link>
      <div>
        <h1 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
          Edit League
        </h1>
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
          Update settings and configuration
        </p>
      </div>

      <LeagueForm
        leagueId={league.id}
        initialData={{
          name: league.name,
          description: league.description || undefined,
          locationId: league.location_id,
          startDate: league.start_date.toISOString().split("T")[0],
          endDate: league.end_date.toISOString().split("T")[0],
          gymRentalCost: league.gym_rental_cost,
          guestFeePerGame: league.guest_fee_per_game,
          paymentDueDates,
          minPlayers: league.min_players || undefined,
          maxPlayers: league.max_players || undefined,
          gameType: league.game_type || undefined,
          gameDescription: league.game_description || undefined,
        }}
        allLocations={allLocations}
      />
    </div>
  );

}
