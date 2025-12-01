"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createLocation, updateLocation } from "@/actions/adminLocationActions";
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
};

type LocationFormProps = {
  mode: "create" | "edit";
  location?: Location;
};

export default function LocationForm({ mode, location }: LocationFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: location?.name || "",
    address: location?.address || "",
    city: location?.city || "",
    description: location?.description || "",
    capacity: location?.capacity?.toString() || "",
    court_count: location?.court_count.toString() || "1",
    price_per_game: location?.price_per_game?.toString() || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        name: formData.name,
        address: formData.address,
        city: formData.city,
        description: formData.description || undefined,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        court_count: parseInt(formData.court_count),
        price_per_game: formData.price_per_game
          ? parseInt(formData.price_per_game)
          : undefined,
      };

      const result =
        mode === "create"
          ? await createLocation(data)
          : await updateLocation(location!.id, data);

      if (result.success) {
        toast.success(result.message);
        router.push("/admin/locations");
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
      {/* Name */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Location Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          placeholder="e.g., Downtown Basketball Court"
          className="w-full px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Address <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.address}
          onChange={(e) =>
            setFormData({ ...formData, address: e.target.value })
          }
          required
          placeholder="e.g., 123 Main Street"
          className="w-full px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* City */}
      <div>
        <label className="block text-sm font-medium mb-2">
          City <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.city}
          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          required
          placeholder="e.g., New York"
          className="w-full px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Court Count */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Number of Courts <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={formData.court_count}
          onChange={(e) =>
            setFormData({ ...formData, court_count: e.target.value })
          }
          required
          min="1"
          className="w-full px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Capacity */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Venue Capacity (optional)
        </label>
        <input
          type="number"
          value={formData.capacity}
          onChange={(e) =>
            setFormData({ ...formData, capacity: e.target.value })
          }
          min="10"
          placeholder="Maximum number of players"
          className="w-full px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Price per game */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Price per Game (optional)
        </label>
        <input
          type="number"
          value={formData.price_per_game}
          onChange={(e) =>
            setFormData({ ...formData, price_per_game: e.target.value })
          }
          min="0"
          placeholder="Cost in dollars"
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
          placeholder="Add details about parking, facilities, access instructions..."
          className="w-full px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        <Button
          type="submit"
          isLoading={loading}
          className="flex-1"
        >
          {mode === "create" ? "Create Location" : "Update Location"}
        </Button>
        <Button
          type="button"
          onClick={() => router.back()}
          variant="secondary"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
