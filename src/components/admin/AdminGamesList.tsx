"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  cancelGame,
  deleteGame,
  markGameAsCompleted,
} from "@/actions/adminGameActions";

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
        "Are you sure you want to delete this game? This action cannot be undone."
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
      <div className="mb-6 flex gap-2 flex-wrap">
        {["all", "scheduled", "completed", "cancelled"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-md capitalize transition-all ${
              filter === f
                ? "bg-blue-600 text-white"
                : "bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Games list */}
      <div className="space-y-4">
        {filteredGames.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No games found for this filter
          </p>
        ) : (
          filteredGames.map((game) => (
            <div
              key={game.id}
              className="bg-white dark:bg-zinc-900 rounded-lg p-4 shadow-md border border-zinc-200 dark:border-zinc-800"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
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
                      className={`px-2 py-1 rounded text-xs text-white ${getStatusColor(game.status)}`}
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
                    <p className="text-sm mt-2 text-gray-700 dark:text-gray-300">
                      {game.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 flex-wrap mt-4">
                <a
                  href={`/admin/games/${game.id}/edit`}
                  className="px-3 py-1 bg-blue-600 dark:bg-blue-700 text-white rounded text-sm hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  ✏️ Edit
                </a>

                {game.status === "SCHEDULED" && (
                  <>
                    <a
                      href={`/admin/games/${game.id}/reschedule`}
                      className="px-3 py-1 bg-zinc-300 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded text-sm hover:bg-zinc-400 dark:hover:bg-zinc-600 transition-colors outline outline-1 outline-zinc-400 dark:outline-zinc-600"
                    >
                      🔄 Reschedule
                    </a>
                    <a
                      href={`/admin/games/${game.id}/change-location`}
                      className="px-3 py-1 bg-zinc-300 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded text-sm hover:bg-zinc-400 dark:hover:bg-zinc-600 transition-colors outline outline-1 outline-zinc-400 dark:outline-zinc-600"
                    >
                      📍 Change Location
                    </a>
                    <button
                      onClick={() => handleCancelGame(game.id)}
                      disabled={loading === game.id}
                      className="px-3 py-1 bg-zinc-300 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded text-sm hover:bg-zinc-400 dark:hover:bg-zinc-600 transition-colors outline outline-1 outline-zinc-400 dark:outline-zinc-600 disabled:opacity-50"
                    >
                      ❌ Cancel Game
                    </button>
                    <button
                      onClick={() => handleMarkCompleted(game.id)}
                      disabled={loading === game.id}
                      className="px-3 py-1 bg-zinc-300 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded text-sm hover:bg-zinc-400 dark:hover:bg-zinc-600 transition-colors outline outline-1 outline-zinc-400 dark:outline-zinc-600 disabled:opacity-50"
                    >
                      ✅ Mark Completed
                    </button>
                  </>
                )}

                <button
                  onClick={() => handleDeleteGame(game.id)}
                  disabled={loading === game.id}
                  className="px-3 py-1 bg-red-600 dark:bg-red-700 text-white rounded text-sm hover:bg-red-700 dark:hover:bg-red-600 transition-colors disabled:opacity-50 ml-auto"
                >
                  🗑️ Delete
                </button>
              </div>

              {loading === game.id && (
                <p className="text-sm text-gray-500 mt-2">Processing...</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
