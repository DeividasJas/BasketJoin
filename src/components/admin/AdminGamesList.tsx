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
import { useRouter, useSearchParams } from "next/navigation";
import {
  MapPin,
  Users,
  Trophy,
  Repeat,
  Edit,
  RotateCcw,
  X,
  CheckCircle,
  Trash2,
} from "lucide-react";

import PageSizeDropdown from "./PageSizeDropdown";

type Game = {
  id: number;
  game_date: Date;
  status: string;
  max_players: number | null;
  min_players: number;
  description: string | null;
  game_type: string | null;
  league_id: string | null;
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
  league?: {
    id: string;
    name: string;
  } | null;
  _count: {
    game_registrations: number;
  };
};

type League = {
  id: string;
  name: string;
  _count: {
    games: number;
  };
};

export default function AdminGamesList({
  games,
  pageSize,
  allLeagues,
  currentStatus,
  currentLeagueId,
}: {
  games: Game[];
  pageSize: number;
  allLeagues: League[];
  currentStatus?: string;
  currentLeagueId?: string;
}) {
  const [loading, setLoading] = useState<number | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

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

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // Reset to page 1 when filtering
    params.set("page", "1");

    router.push(`?${params.toString()}`);
  };

  const statusStyle: Record<string, string> = {
    SCHEDULED:
      "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    CANCELLED: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
    COMPLETED:
      "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",
    IN_PROGRESS:
      "bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400",
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Filters */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {[null, "scheduled", "completed", "cancelled"].map((status) => (
            <button
              key={status || "all"}
              onClick={() => updateFilter("status", status)}
              className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
                currentStatus === status || (!currentStatus && !status)
                  ? "bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              {status
                ? status.charAt(0).toUpperCase() + status.slice(1)
                : "All"}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <select
            value={currentLeagueId || ""}
            onChange={(e) => updateFilter("leagueId", e.target.value || null)}
            className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs text-zinc-600 focus:border-basket-400 focus:outline-none focus:ring-2 focus:ring-basket-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          >
            <option value="">All Leagues</option>
            {allLeagues.map((league) => (
              <option key={league.id} value={league.id}>
                {league.name} ({league._count.games})
              </option>
            ))}
          </select>
          <PageSizeDropdown pageSize={pageSize} />
        </div>
      </div>

      {/* Games list */}
      <div className="flex flex-col gap-2">
        {games.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-400 dark:text-zinc-500">
            No games found
          </p>
        ) : (
          games.map((game) => (
            <div
              key={game.id}
              className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700/60 dark:bg-zinc-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
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
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusStyle[game.status] || "bg-zinc-100 text-zinc-500"}`}
                    >
                      {game.status}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {game.location.name}
                    </span>
                    <span className="flex items-center gap-1 tabular-nums">
                      <Users className="h-3 w-3" />
                      {game._count.game_registrations}/{game.max_players || "∞"}
                    </span>
                    {game.league && (
                      <span className="flex items-center gap-1">
                        <Repeat className="h-3 w-3" />
                        {game.league.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                <Button
                  asChild
                  size="sm"
                  className="h-7 bg-basket-400 text-[11px] text-white hover:bg-basket-300"
                >
                  <Link href={`/dashboard/games/${game.id}/edit`}>
                    <Edit className="mr-1 h-3 w-3" />
                    Edit
                  </Link>
                </Button>

                {game.status === "SCHEDULED" && (
                  <>
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="h-7 text-[11px] text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                    >
                      <Link href={`/dashboard/games/${game.id}/reschedule`}>
                        <RotateCcw className="mr-1 h-3 w-3" />
                        Reschedule
                      </Link>
                    </Button>
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="h-7 text-[11px] text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                    >
                      <Link href={`/dashboard/games/${game.id}/change-location`}>
                        <MapPin className="mr-1 h-3 w-3" />
                        <span className="hidden sm:inline">Location</span>
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancelGame(game.id)}
                      isLoading={loading === game.id}
                      className="h-7 text-[11px] text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                    >
                      <X className="mr-1 h-3 w-3" />
                      Cancel
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkCompleted(game.id)}
                      isLoading={loading === game.id}
                      className="h-7 text-[11px] text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                    >
                      <CheckCircle className="mr-1 h-3 w-3" />
                      <span className="hidden sm:inline">Complete</span>
                    </Button>
                  </>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteGame(game.id)}
                  isLoading={loading === game.id}
                  className="ml-auto h-7 text-[11px] text-red-500 hover:bg-red-500/10 hover:text-red-600"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
