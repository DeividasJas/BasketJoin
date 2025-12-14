"use client";

import { useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  toggleLocationActive,
  deleteLocation,
  forceDeleteLocation,
} from "@/actions/adminLocationActions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import PageSizeDropdown from "./PageSizeDropdown";
import {
  MapPin,
  Users,
  Trophy,
  DollarSign,
  Gamepad2,
  Edit,
  RotateCcw,
  CheckCircle,
  Trash2,
} from "lucide-react";

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
  locations,
  cities,
  totalLocations,
  pageSize,
}: {
  locations: Location[];
  cities: string[];
  totalLocations: number;
  pageSize: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<number | null>(null);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    router.push(
      `/dashboard/locations?${createQueryString(e.target.name, e.target.value)}`
    );
  };

  const handleToggleActive = async (locationId: number) => {
    setLoading(locationId);
    const result = await toggleLocationActive(locationId);
    setLoading(null);

    if (result.success) {
      toast.success(result.message);
      router.refresh();
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
      router.refresh();
    } else if (result.requiresConfirmation) {
      if (
        confirm(
          result.message + "\n\nAre you sure you want to permanently delete?"
        )
      ) {
        setLoading(locationId);
        const forceResult = await forceDeleteLocation(locationId);
        setLoading(null);

        if (forceResult.success) {
          toast.success(forceResult.message);
          router.refresh();
        } else {
          toast.error(forceResult.message);
        }
      }
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="w-full">
      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <input
          type="text"
          name="search"
          placeholder="Search locations by name, address, or city..."
          defaultValue={searchParams.get("search") || ""}
          onChange={handleFilterChange}
          className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-zinc-700 dark:bg-zinc-800"
        />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <select
              name="isActive"
              value={searchParams.get("isActive") || "all"}
              onChange={handleFilterChange}
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 dark:border-zinc-700 dark:bg-zinc-800"
            >
              <option value="all">All Locations</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>

            <select
              name="city"
              value={searchParams.get("city") || ""}
              onChange={handleFilterChange}
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 dark:border-zinc-700 dark:bg-zinc-800"
            >
              <option value="">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
          <PageSizeDropdown pageSize={pageSize} />
        </div>
      </div>

      <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        Showing {locations.length} of {totalLocations} locations
      </p>

      <div className="space-y-4">
        {locations.length === 0 ? (
          <p className="py-8 text-center text-gray-500">No locations found</p>
        ) : (
          locations.map((location) => (
            <div
              key={location.id}
              className={`rounded-lg border-2 bg-white p-4 shadow-md dark:bg-zinc-900 ${location.is_active
                ? "border-zinc-200 dark:border-zinc-800"
                : "border-red-300 opacity-60 dark:border-red-900"
              }`}
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <h3 className="text-lg font-bold">{location.name}</h3>
                    {!location.is_active && (
                      <span className="rounded bg-red-500 px-2 py-1 text-xs text-white">
                        INACTIVE
                      </span>
                    )}
                  </div>
                  <p className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4" />
                    {location.address}, {location.city}
                  </p>
                  {location.description && (
                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                      {location.description}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                    {location.capacity && (
                      <span className="flex items-center gap-1.5">
                        <Users className="h-4 w-4" />
                        Capacity: {location.capacity}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Trophy className="h-4 w-4" />
                      Courts: {location.court_count}
                    </span>
                    {location.price_per_game && (
                      <span className="flex items-center gap-1.5">
                        <DollarSign className="h-4 w-4" />
                        ${location.price_per_game}/game
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Gamepad2 className="h-4 w-4" />
                      {location._count.games} games hosted
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button asChild size="sm">
                  <Link
                    href={`/dashboard/locations/${location.id}/edit`}
                    className="flex items-center gap-1.5"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="hidden sm:inline">Edit</span>
                  </Link>
                </Button>

                <Button asChild variant="outline" size="sm">
                  <Link
                    href={`/dashboard/locations/${location.id}/games`}
                    className="flex items-center gap-1.5"
                  >
                    <Gamepad2 className="h-4 w-4" />
                    <span className="hidden md:inline">View Games ({location._count.games})</span>
                    <span className="md:hidden">({location._count.games})</span>
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleActive(location.id)}
                  isLoading={loading === location.id}
                  className="flex items-center gap-1.5"
                >
                  {location.is_active ? (
                    <>
                      <RotateCcw className="h-4 w-4" />
                      <span className="hidden sm:inline">Deactivate</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span className="hidden sm:inline">Activate</span>
                    </>
                  )}
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(location.id)}
                  isLoading={loading === location.id}
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