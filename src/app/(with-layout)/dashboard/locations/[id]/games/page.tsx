import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getLocationWithGames } from "@/actions/adminLocationActions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function LocationGamesPage({
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

  const result = await getLocationWithGames(parseInt(id));

  if (!result.success || !result.location) {
    redirect("/dashboard/locations");
  }

  const { location } = result;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      <Link
        href="/dashboard/locations"
        className="mb-4 inline-flex items-center gap-1 text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Locations
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">{location.name}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          📍 {location.address}, {location.city}
        </p>
      </div>

      <div className="mb-6 rounded-lg bg-zinc-100 p-4 dark:bg-zinc-800">
        <h2 className="mb-2 font-bold">Location Details:</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {location.capacity && <p>👥 Capacity: {location.capacity}</p>}
          <p>🏀 Courts: {location.court_count}</p>
          {location.price_per_game && (
            <p>💵 Price: ${location.price_per_game}/game</p>
          )}
          <p>
            Status:{" "}
            <span
              className={
                location.is_active
                  ? "font-semibold text-zinc-700 dark:text-zinc-300"
                  : "font-semibold text-red-600 dark:text-red-400"
              }
            >
              {location.is_active ? "Active" : "Inactive"}
            </span>
          </p>
        </div>
        {location.description && (
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            {location.description}
          </p>
        )}
      </div>

      <div>
        <h2 className="mb-4 text-2xl font-bold">
          Games at this Location ({location.games.length} recent)
        </h2>

        {location.games.length === 0 ? (
          <p className="py-8 text-center text-gray-500">
            No games scheduled at this location yet.
          </p>
        ) : (
          <div className="space-y-4">
            {location.games.map((game) => (
              <div
                key={game.id}
                className="rounded-lg border border-zinc-200 bg-white p-4 shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold">
                      {new Date(game.game_date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                      {" at "}
                      {new Date(game.game_date).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Status: {game.status}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Players: {game._count.game_registrations}
                      {game.max_players && `/${game.max_players}`}
                    </p>
                    {game.description && (
                      <p className="mt-2 text-sm">{game.description}</p>
                    )}
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/game-status/${game.id}`}>View Details</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
