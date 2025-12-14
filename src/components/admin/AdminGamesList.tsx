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
  series_id: string | null;
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
  series?: {
    id: string;
    name: string;
  } | null;
  _count: {
    game_registrations: number;
  };
};

type Series = {
  id: string;
  name: string;
  _count: {
    games: number;
  };
};

export default function AdminGamesList({
  games,
  pageSize,
  allSeries,
  currentStatus,
  currentSeriesId,
}: {
  games: Game[];
  pageSize: number;
  allSeries: Series[];
  currentStatus?: string;
  currentSeriesId?: string;
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

  return (
    <div className="w-full">
      {/* Filter tabs and Page Size Dropdown */}

      <div className="mb-6 flex flex-col gap-4">
        {/* Status Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">Status:</span>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => updateFilter("status", null)}
              variant={!currentStatus ? "default" : "secondary"}
              size="sm"
            >
              All
            </Button>
            {["scheduled", "completed", "cancelled"].map((status) => (
              <Button
                key={status}
                onClick={() => updateFilter("status", status)}
                variant={currentStatus === status ? "default" : "secondary"}
                size="sm"
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Series Filter and Page Size */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Series:</span>
            <select
              value={currentSeriesId || ""}
              onChange={(e) => updateFilter("seriesId", e.target.value || null)}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800"
            >
              <option value="">All Series</option>
              {allSeries.map((series) => (
                <option key={series.id} value={series.id}>
                  {series.name} ({series._count.games} games)
                </option>
              ))}
            </select>
          </div>

          <PageSizeDropdown pageSize={pageSize} />
        </div>
      </div>

      {/* Games list */}
      <div className="space-y-4">
        {games.length === 0 ? (
          <p className="py-8 text-center text-gray-500">
            No games found for this filter
          </p>
        ) : (
          games.map((game) => (
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
                  <p className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4" />
                    {game.location.name} - {game.location.city}
                  </p>
                  <p className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                    <Users className="h-4 w-4" />
                    {game._count.game_registrations}/{game.max_players || "∞"}{" "}
                    players
                  </p>
                  {game.game_type && (
                    <p className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                      <Trophy className="h-4 w-4" />
                      {game.game_type}
                    </p>
                  )}
                  {game.series && (
                    <p className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                      <Repeat className="h-4 w-4" />
                      {game.series.name}
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
                  <Link
                    href={`/dashboard/games/${game.id}/edit`}
                    className="flex items-center gap-1.5"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="hidden sm:inline">Edit</span>
                  </Link>
                </Button>

                {game.status === "SCHEDULED" && (
                  <>
                    <Button asChild variant="outline" size="sm">
                      <Link
                        href={`/dashboard/locations/${game.id}/reschedule`}
                        className="flex items-center gap-1.5"
                      >
                        <RotateCcw className="h-4 w-4" />
                        <span className="hidden sm:inline">Reschedule</span>
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <Link
                        href={`/dashboard/locations/${game.id}/change-location`}
                        className="flex items-center gap-1.5"
                      >
                        <MapPin className="h-4 w-4" />
                        <span className="hidden lg:inline">Change Location</span>
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancelGame(game.id)}
                      isLoading={loading === game.id}
                      className="flex items-center gap-1.5"
                    >
                      <X className="h-4 w-4" />
                      <span className="hidden md:inline">Cancel Game</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkCompleted(game.id)}
                      isLoading={loading === game.id}
                      className="flex items-center gap-1.5"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span className="hidden lg:inline">Mark Completed</span>
                    </Button>
                  </>
                )}

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteGame(game.id)}
                  isLoading={loading === game.id}
                  className="ml-auto flex items-center gap-1.5"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Delete</span>
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
