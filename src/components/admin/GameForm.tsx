"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createGame, updateGame } from "@/actions/adminGameActions";

type Location = {
  id: number;
  name: string;
  address: string;
  city: string;
};

type Game = {
  id: number;
  game_date: Date;
  location_id: number;
  max_players: number | null;
  min_players: number;
  description: string | null;
  game_type: string | null;
};

type GameFormProps = {
  locations: Location[];
  mode: "create" | "edit";
  game?: Game;
};

export default function GameForm({ locations, mode, game }: GameFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Initialize form with game data or defaults
  const [formData, setFormData] = useState({
    game_date: game
      ? new Date(game.game_date).toISOString().slice(0, 16)
      : "",
    location_id: game?.location_id.toString() || "",
    max_players: game?.max_players?.toString() || "",
    min_players: game?.min_players.toString() || "10",
    description: game?.description || "",
    game_type: game?.game_type || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        game_date: new Date(formData.game_date),
        location_id: parseInt(formData.location_id),
        max_players: formData.max_players
          ? parseInt(formData.max_players)
          : undefined,
        min_players: parseInt(formData.min_players),
        description: formData.description || undefined,
        game_type: formData.game_type || undefined,
      };

      const result =
        mode === "create"
          ? await createGame(data)
          : await updateGame(game!.id, data);

      if (result.success) {
        toast.success(result.message);
        router.push("/admin");
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-md space-y-4"
    >
      {/* Date and Time */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Date and Time <span className="text-red-500">*</span>
        </label>
        <input
          type="datetime-local"
          value={formData.game_date}
          onChange={(e) =>
            setFormData({ ...formData, game_date: e.target.value })
          }
          required
          className="w-full px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Location <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.location_id}
          onChange={(e) =>
            setFormData({ ...formData, location_id: e.target.value })
          }
          required
          className="w-full px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a location</option>
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name} - {location.city}
            </option>
          ))}
        </select>
      </div>

      {/* Min Players */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Minimum Players <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={formData.min_players}
          onChange={(e) =>
            setFormData({ ...formData, min_players: e.target.value })
          }
          required
          min="2"
          className="w-full px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Max Players */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Maximum Players (optional)
        </label>
        <input
          type="number"
          value={formData.max_players}
          onChange={(e) =>
            setFormData({ ...formData, max_players: e.target.value })
          }
          min="2"
          placeholder="No limit"
          className="w-full px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Game Type */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Game Type (optional)
        </label>
        <input
          type="text"
          value={formData.game_type}
          onChange={(e) =>
            setFormData({ ...formData, game_type: e.target.value })
          }
          placeholder="e.g., Pickup, Tournament, League"
          className="w-full px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Description (optional)
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          rows={4}
          placeholder="Add any special instructions or notes..."
          className="w-full px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : mode === "create" ? "Create Game" : "Update Game"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 bg-zinc-300 dark:bg-zinc-700 rounded-md hover:bg-zinc-400 dark:hover:bg-zinc-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
