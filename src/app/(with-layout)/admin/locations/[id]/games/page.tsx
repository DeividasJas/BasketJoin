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
    redirect("/admin/locations");
  }

  const { location } = result;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      <Link
        href="/admin/locations"
        className="inline-flex items-center gap-1 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Locations
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">{location.name}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          📍 {location.address}, {location.city}
        </p>
      </div>

      <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 mb-6">
        <h2 className="font-bold mb-2">Location Details:</h2>
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
                  ? "text-zinc-700 dark:text-zinc-300 font-semibold"
                  : "text-red-600 dark:text-red-400 font-semibold"
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
        <h2 className="text-2xl font-bold mb-4">
          Games at this Location ({location.games.length} recent)
        </h2>

        {location.games.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No games scheduled at this location yet.
          </p>
        ) : (
          <div className="space-y-4">
            {location.games.map((game) => (
              <div
                key={game.id}
                className="bg-white dark:bg-zinc-900 rounded-lg p-4 shadow-md border border-zinc-200 dark:border-zinc-800"
              >
                <div className="flex justify-between items-start">
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
                      <p className="text-sm mt-2">{game.description}</p>
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
