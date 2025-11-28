"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { changeGameLocation } from "@/actions/adminGameActions";

type Location = {
  id: number;
  name: string;
  address: string;
  city: string;
};

export default function ChangeLocationForm({
  gameId,
  currentLocationId,
  locations,
  playerCount,
}: {
  gameId: number;
  currentLocationId: number;
  locations: Location[];
  playerCount: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [newLocationId, setNewLocationId] = useState(
    currentLocationId.toString()
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (parseInt(newLocationId) === currentLocationId) {
      toast.error("Please select a different location");
      return;
    }

    setLoading(true);

    try {
      const result = await changeGameLocation(gameId, parseInt(newLocationId));

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
      <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-400 dark:border-yellow-700 rounded-lg p-4">
        <p className="text-sm">
          ⚠️ This will notify all <strong>{playerCount} registered
          players</strong> about the location change.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          New Location <span className="text-red-500">*</span>
        </label>
        <select
          value={newLocationId}
          onChange={(e) => setNewLocationId(e.target.value)}
          required
          className="w-full px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name} - {location.city}
              {location.id === currentLocationId && " (Current)"}
            </option>
          ))}
        </select>
        {locations.find((l) => l.id === parseInt(newLocationId)) && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            📍 {locations.find((l) => l.id === parseInt(newLocationId))?.address}
          </p>
        )}
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Changing Location..." : "Change Location"}
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
