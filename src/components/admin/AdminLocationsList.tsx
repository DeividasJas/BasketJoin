"use client";

import { useState } from "react";
import { toast } from "sonner";
import { toggleLocationActive, deleteLocation, forceDeleteLocation } from "@/actions/adminLocationActions";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Location = {
  id: number;
  name: string;
  address: string;
  city: string;
  description: string | null;
  capacity: number | null;
  court_count: number;
  price_per_game: number | null;
  is_active: boolean;
  image_url: string | null;
  _count: {
    games: number;
  };
};

export default function AdminLocationsList({
  initialLocations,
  cities,
}: {
  initialLocations: Location[];
  cities: string[];
}) {
  const [locations, setLocations] = useState(initialLocations);
  const [loading, setLoading] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");

  const handleToggleActive = async (locationId: number) => {
    setLoading(locationId);
    const result = await toggleLocationActive(locationId);
    setLoading(null);

    if (result.success) {
      toast.success(result.message);
      // Update local state
      setLocations((prev) =>
        prev.map((loc) =>
          loc.id === locationId ? { ...loc, is_active: result.location.is_active } : loc
        )
      );
    } else {
      toast.error(result.message);
    }
  };

  const handleDelete = async (locationId: number) => {
    if (!confirm("Are you sure you want to delete this location?")) {
      return;
    }

    setLoading(locationId);
    const result = await deleteLocation(locationId);
    setLoading(null);

    if (result.success) {
      toast.success(result.message);
      setLocations((prev) => prev.filter((loc) => loc.id !== locationId));
    } else if (result.requiresConfirmation) {
      // Ask for force delete confirmation
      if (confirm(result.message + "\n\nAre you sure you want to permanently delete?")) {
        setLoading(locationId);
        const forceResult = await forceDeleteLocation(locationId);
        setLoading(null);

        if (forceResult.success) {
          toast.success(forceResult.message);
          setLocations((prev) => prev.filter((loc) => loc.id !== locationId));
        } else {
          toast.error(forceResult.message);
        }
      }
    } else {
      toast.error(result.message);
    }
  };

  // Filter locations
  const filteredLocations = locations.filter((location) => {
    const matchesSearch =
      !searchTerm ||
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCity = !filterCity || location.city === filterCity;

    const matchesActive =
      filterActive === "all" ||
      (filterActive === "active" && location.is_active) ||
      (filterActive === "inactive" && !location.is_active);

    return matchesSearch && matchesCity && matchesActive;
  });

  return (
    <div className="w-full">
      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        {/* Search bar */}
        <input
          type="text"
          placeholder="Search locations by name, address, or city..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {/* Active/Inactive filter */}
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value as any)}
            className="px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
          >
            <option value="all">All Locations</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          {/* City filter */}
          <select
            value={filterCity}
            onChange={(e) => setFilterCity(e.target.value)}
            className="px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
          >
            <option value="">All Cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results count */}
      <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Showing {filteredLocations.length} of {locations.length} locations
      </p>

      {/* Locations list */}
      <div className="space-y-4">
        {filteredLocations.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No locations found</p>
        ) : (
          filteredLocations.map((location) => (
            <div
              key={location.id}
              className={`bg-white dark:bg-zinc-900 rounded-lg p-4 shadow-md border-2 ${
                location.is_active
                  ? "border-zinc-200 dark:border-zinc-800"
                  : "border-red-300 dark:border-red-900 opacity-60"
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold">{location.name}</h3>
                    {!location.is_active && (
                      <span className="px-2 py-1 rounded text-xs bg-red-500 text-white">
                        INACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    📍 {location.address}, {location.city}
                  </p>
                  {location.description && (
                    <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">
                      {location.description}
                    </p>
                  )}
                  <div className="flex gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {location.capacity && <span>👥 Capacity: {location.capacity}</span>}
                    <span>🏀 Courts: {location.court_count}</span>
                    {location.price_per_game && (
                      <span>💵 ${location.price_per_game}/game</span>
                    )}
                    <span>🎮 {location._count.games} games hosted</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 flex-wrap mt-4">
                <Button asChild size="sm">
                  <Link href={`/admin/locations/${location.id}/edit`}>
                    ✏️ Edit
                  </Link>
                </Button>

                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/locations/${location.id}/games`}>
                    🎮 View Games ({location._count.games})
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleActive(location.id)}
                  isLoading={loading === location.id}
                >
                  {location.is_active ? "🔄 Deactivate" : "✅ Activate"}
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(location.id)}
                  isLoading={loading === location.id}
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
