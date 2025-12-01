"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  cancelGame,
  deleteGame,
  markGameAsCompleted,
} from "@/actions/adminGameActions";
import Link from "next/link";
import { Button } from "../ui/button";

type Game = {
  id: number;
  game_date: Date;
  status: string;
  max_players: number | null;
  min_players: number;
  description: string | null;
  game_type: string | null;
  location: {
    id: number;
    name: string;
    address: string;
    city: string;
  };
  organizer: {
    given_name: string | null;
    family_name: string | null;
    email: string | null;
  } | null;
  _count: {
    game_registrations: number;
  };
};

export default function AdminGamesList({ games }: { games: Game[] }) {
  const [loading, setLoading] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const handleCancelGame = async (gameId: number) => {
    const reason = prompt("Enter cancellation reason (optional):");
    if (reason === null) return; // User clicked cancel

    setLoading(gameId);
    const result = await cancelGame(gameId, reason || undefined);
    setLoading(null);

    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const handleDeleteGame = async (gameId: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this game? This action cannot be undone.",
      )
    ) {
      return;
    }

    setLoading(gameId);
    const result = await deleteGame(gameId);
    setLoading(null);

    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const handleMarkCompleted = async (gameId: number) => {
    setLoading(gameId);
    const result = await markGameAsCompleted(gameId);
    setLoading(null);

    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return "bg-blue-500";
      case "CANCELLED":
        return "bg-red-500";
      case "COMPLETED":
        return "bg-green-500";
      case "IN_PROGRESS":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const filteredGames = games.filter((game) => {
    if (filter === "all") return true;
    return game.status === filter.toUpperCase();
  });

  return (
    <div className="w-full">
      {/* Filter tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {["all", "scheduled", "completed", "cancelled"].map((f) => (
          <Button
            key={f}
            onClick={() => setFilter(f)}
            variant={filter === f ? "default" : "secondary"}
          >
            {f}
          </Button>
        ))}
      </div>

      {/* Games list */}
      <div className="space-y-4">
        {filteredGames.length === 0 ? (
          <p className="py-8 text-center text-gray-500">
            No games found for this filter
          </p>
        ) : (
          filteredGames.map((game) => (
            <div
              key={game.id}
              className="rounded-lg border border-zinc-200 bg-white p-4 shadow-md dark:border-zinc-800 dark:bg-zinc-900"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <h3 className="text-lg font-bold">
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
                    <span
                      className={`rounded px-2 py-1 text-xs text-white ${getStatusColor(
                        game.status,
                      )}`}
                    >
                      {game.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    📍 {game.location.name} - {game.location.city}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    👥 {game._count.game_registrations}/
                    {game.max_players || "∞"} players
                  </p>
                  {game.game_type && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      🏀 {game.game_type}
                    </p>
                  )}
                  {game.description && (
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                      {game.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild size="sm">
                  <Link href={`/dashboard/locations/${game.id}/edit`}>
                    ✏️ Edit
                  </Link>
                </Button>

                {game.status === "SCHEDULED" && (
                  <>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/dashboard/locations/${game.id}/reschedule`}>
                        🔄 Reschedule
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link
                        href={`/dashboard/locations/${game.id}/change-location`}
                      >
                        📍 Change Location
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelGame(game.id)}
                      isLoading={loading === game.id}
                    >
                      ❌ Cancel Game
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkCompleted(game.id)}
                      isLoading={loading === game.id}
                    >
                      ✅ Mark Completed
                    </Button>
                  </>
                )}

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteGame(game.id)}
                  isLoading={loading === game.id}
                  className="ml-auto"
                >
                  🗑️ Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
