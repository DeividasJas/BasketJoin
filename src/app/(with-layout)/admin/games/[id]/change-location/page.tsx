import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/utils/prisma";
import { getAllLocations } from "@/actions/adminGameActions";
import ChangeLocationForm from "@/components/admin/ChangeLocationForm";

export default async function ChangeLocationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user) {
    redirect("/login");
  }

  const userRole = session.user.role;
  if (userRole !== "ADMIN" && userRole !== "ORGANIZER") {
    redirect("/");
  }

  const [game, { locations }] = await Promise.all([
    prisma.games.findUnique({
      where: { id: parseInt(id) },
      include: {
        location: true,
        _count: {
          select: {
            game_registrations: {
              where: { status: "CONFIRMED" },
            },
          },
        },
      },
    }),
    getAllLocations(),
  ]);

  if (!game) {
    redirect("/admin");
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Change Game Location</h1>

      <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 mb-6">
        <h2 className="font-bold mb-2">Current Game Details:</h2>
        <p>Date: {new Date(game.game_date).toLocaleString()}</p>
        <p>Current Location: {game.location.name}</p>
        <p>Registered Players: {game._count.game_registrations}</p>
      </div>

      <ChangeLocationForm
        gameId={game.id}
        currentLocationId={game.location_id}
        locations={locations}
        playerCount={game._count.game_registrations}
      />
    </div>
  );
}
