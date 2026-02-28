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
    <div className="flex flex-col gap-6">
      <Link
        href="/dashboard/locations"
        className="inline-flex items-center gap-1 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
      >
        <ArrowLeft className="h-3 w-3" />
        Locations
      </Link>

      <div>
        <h1 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
          {location.name}
        </h1>
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
          {location.address}, {location.city}
        </p>
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700/60 dark:bg-zinc-900">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
          Location Details
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs text-zinc-600 dark:text-zinc-300">
          {location.capacity && (
            <p>
              <span className="text-zinc-400">Capacity:</span>{" "}
              <span className="tabular-nums">{location.capacity}</span>
            </p>
          )}
          <p>
            <span className="text-zinc-400">Courts:</span>{" "}
            <span className="tabular-nums">{location.court_count}</span>
          </p>
          {location.price_per_game && (
            <p>
              <span className="text-zinc-400">Price:</span>{" "}
              <span className="tabular-nums">
                ${location.price_per_game}/game
              </span>
            </p>
          )}
          <p>
            <span className="text-zinc-400">Status:</span>{" "}
            <span
              className={
                location.is_active
                  ? "font-medium text-green-600 dark:text-green-400"
                  : "font-medium text-red-500 dark:text-red-400"
              }
            >
              {location.is_active ? "Active" : "Inactive"}
            </span>
          </p>
        </div>
        {location.description && (
          <p className="mt-3 border-t border-zinc-100 pt-3 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            {location.description}
          </p>
        )}
      </section>

      <section>
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
          Games ({location.games.length} recent)
        </p>

        {location.games.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-400 dark:text-zinc-500">
            No games scheduled yet.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {location.games.map((game) => (
              <div
                key={game.id}
                className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700/60 dark:bg-zinc-900"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium tabular-nums text-zinc-800 dark:text-zinc-100">
                    {new Date(game.game_date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                    {" at "}
                    {new Date(game.game_date).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <span>{game.status}</span>
                    <span>&middot;</span>
                    <span className="tabular-nums">
                      {game._count.game_registrations}
                      {game.max_players && `/${game.max_players}`} players
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="shrink-0 text-xs text-basket-400 hover:text-basket-300"
                >
                  <Link href={`/game-status/${game.id}`}>View</Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
