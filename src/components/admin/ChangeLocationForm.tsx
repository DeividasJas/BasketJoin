"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { changeGameLocation } from "@/actions/adminGameActions";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

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
        router.push("/dashboard/games");
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const selectedLocation = locations.find(
    (l) => l.id === parseInt(newLocationId),
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700/60 dark:bg-zinc-900"
    >
      <div className="rounded-lg border border-basket-400/20 bg-basket-400/5 p-3.5">
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          This will notify all <strong className="text-zinc-800 dark:text-zinc-200">{playerCount} registered
          players</strong> about the location change.
        </p>
      </div>

      <div>
        <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400">
          New Location <span className="text-red-500">*</span>
        </label>
        <select
          value={newLocationId}
          onChange={(e) => setNewLocationId(e.target.value)}
          required
          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-sm focus:border-basket-400 focus:outline-none focus:ring-2 focus:ring-basket-400/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
        >
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name} - {location.city}
              {location.id === currentLocationId && " (Current)"}
            </option>
          ))}
        </select>
        {selectedLocation && (
          <p className="mt-1.5 flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500">
            <MapPin className="h-3 w-3" />
            {selectedLocation.address}
          </p>
        )}
      </div>

      <div className="flex gap-3 border-t border-zinc-100 pt-5 dark:border-zinc-800">
        <Button
          type="submit"
          isLoading={loading}
          className="flex-1 bg-basket-400 text-white hover:bg-basket-300"
        >
          Change Location
        </Button>
        <Button
          type="button"
          onClick={() => router.back()}
          variant="ghost"
          className="text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
