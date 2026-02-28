import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/utils/prisma";
import LeagueForm from "@/components/admin/LeagueForm";

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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit League</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Update league settings and configuration
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
