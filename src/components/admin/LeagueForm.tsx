"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar, X } from "lucide-react";
import { toast } from "sonner";
import { createLeague, updateLeague } from "@/actions/leagueActions";

interface LeagueFormProps {
  leagueId?: string;
  initialData?: {
    name: string;
    description?: string;
    locationId: number;
    startDate: string;
    endDate: string;
    gymRentalCost: number;
    guestFeePerGame: number;
    paymentDueDates: string[];
    minPlayers?: number;
    maxPlayers?: number;
    gameType?: string;
    gameDescription?: string;
  };
  allLocations: Array<{ id: number; name: string; address: string; city: string }>;
}

export default function LeagueForm({
  leagueId,
  initialData,
  allLocations,
}: LeagueFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    locationId: initialData?.locationId?.toString() || "",
    startDate: initialData?.startDate || "",
    endDate: initialData?.endDate || "",
    gymRentalCost: initialData?.gymRentalCost
      ? (initialData.gymRentalCost / 100).toString()
      : "",
    guestFeePerGame: initialData?.guestFeePerGame
      ? (initialData.guestFeePerGame / 100).toString()
      : "",
    paymentDueDates: initialData?.paymentDueDates || [],
    minPlayers: initialData?.minPlayers?.toString() || "10",
    maxPlayers: initialData?.maxPlayers?.toString() || "",
    gameType: initialData?.gameType || "",
    gameDescription: initialData?.gameDescription || "",
  });

  const [newDueDate, setNewDueDate] = useState("");

  const handleAddDueDate = () => {
    if (!newDueDate) {
      toast.error("Please select a date");
      return;
    }

    if (formData.paymentDueDates.includes(newDueDate)) {
      toast.error("This date is already added");
      return;
    }

    setFormData({
      ...formData,
      paymentDueDates: [...formData.paymentDueDates, newDueDate].sort(),
    });
    setNewDueDate("");
  };

  const handleRemoveDueDate = (date: string) => {
    setFormData({
      ...formData,
      paymentDueDates: formData.paymentDueDates.filter((d) => d !== date),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate
      if (!formData.locationId) {
        toast.error("Please select a location");
        setLoading(false);
        return;
      }

      if (formData.paymentDueDates.length === 0) {
        toast.error("Please add at least one payment due date");
        setLoading(false);
        return;
      }

      const gymRentalCents = Math.round(
        parseFloat(formData.gymRentalCost) * 100,
      );
      const guestFeeCents = Math.round(
        parseFloat(formData.guestFeePerGame) * 100,
      );

      if (leagueId) {
        // Update existing league
        const result = await updateLeague(leagueId, {
          name: formData.name,
          description: formData.description || undefined,
          locationId: parseInt(formData.locationId),
          startDate: new Date(formData.startDate),
          endDate: new Date(formData.endDate),
          gymRentalCost: gymRentalCents,
          guestFeePerGame: guestFeeCents,
          paymentDueDates: formData.paymentDueDates,
          minPlayers: formData.minPlayers ? parseInt(formData.minPlayers) : undefined,
          maxPlayers: formData.maxPlayers ? parseInt(formData.maxPlayers) : undefined,
          gameType: formData.gameType || undefined,
          gameDescription: formData.gameDescription || undefined,
        });

        if (result.success) {
          toast.success(result.message);
          router.push(`/dashboard/leagues/${leagueId}`);
        } else {
          toast.error(result.message);
        }
      } else {
        // Create new league
        const result = await createLeague({
          name: formData.name,
          description: formData.description || undefined,
          locationId: parseInt(formData.locationId),
          startDate: new Date(formData.startDate),
          endDate: new Date(formData.endDate),
          gymRentalCost: gymRentalCents,
          guestFeePerGame: guestFeeCents,
          paymentDueDates: formData.paymentDueDates,
          minPlayers: formData.minPlayers ? parseInt(formData.minPlayers) : undefined,
          maxPlayers: formData.maxPlayers ? parseInt(formData.maxPlayers) : undefined,
          gameType: formData.gameType || undefined,
          gameDescription: formData.gameDescription || undefined,
        });

        if (result.success && result.league) {
          toast.success(result.message);
          router.push(`/dashboard/leagues/${result.league.id}`);
        } else {
          toast.error(result.message);
        }
      }
    } catch (error) {
      console.error("Error submitting league:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-4 text-lg font-semibold">Basic Information</h2>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="locationId"
              className="mb-2 block text-sm font-medium"
            >
              Location
            </label>
            <select
              id="locationId"
              value={formData.locationId}
              onChange={(e) =>
                setFormData({ ...formData, locationId: e.target.value })
              }
              required
              disabled={!!leagueId}
              className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2 dark:border-zinc-700 dark:bg-zinc-800"
            >
              <option value="">Select a location</option>
              {allLocations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name} - {location.city}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium">
              League Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              placeholder="e.g., Tuesday Night Basketball - Winter 2025"
              className="w-full rounded-md border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-800"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="mb-2 block text-sm font-medium"
            >
              Description (optional)
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              placeholder="Brief description of the league..."
              className="w-full rounded-md border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-800"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="startDate"
                className="mb-2 block text-sm font-medium"
              >
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                required
                className="w-full rounded-md border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-800"
              />
            </div>

            <div>
              <label
                htmlFor="endDate"
                className="mb-2 block text-sm font-medium"
              >
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                required
                className="w-full rounded-md border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-4 text-lg font-semibold">Game Settings</h2>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="minPlayers"
                className="mb-2 block text-sm font-medium"
              >
                Minimum Players
              </label>
              <input
                type="number"
                id="minPlayers"
                value={formData.minPlayers}
                onChange={(e) =>
                  setFormData({ ...formData, minPlayers: e.target.value })
                }
                min="1"
                placeholder="10"
                className="w-full rounded-md border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-800"
              />
            </div>

            <div>
              <label
                htmlFor="maxPlayers"
                className="mb-2 block text-sm font-medium"
              >
                Maximum Players (optional)
              </label>
              <input
                type="number"
                id="maxPlayers"
                value={formData.maxPlayers}
                onChange={(e) =>
                  setFormData({ ...formData, maxPlayers: e.target.value })
                }
                min="1"
                placeholder="20"
                className="w-full rounded-md border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="gameType"
              className="mb-2 block text-sm font-medium"
            >
              Game Type (optional)
            </label>
            <input
              type="text"
              id="gameType"
              value={formData.gameType}
              onChange={(e) =>
                setFormData({ ...formData, gameType: e.target.value })
              }
              placeholder="e.g., 5v5, Full Court"
              className="w-full rounded-md border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-800"
            />
          </div>

          <div>
            <label
              htmlFor="gameDescription"
              className="mb-2 block text-sm font-medium"
            >
              Game Description (optional)
            </label>
            <textarea
              id="gameDescription"
              value={formData.gameDescription}
              onChange={(e) =>
                setFormData({ ...formData, gameDescription: e.target.value })
              }
              rows={2}
              placeholder="Additional game details..."
              className="w-full rounded-md border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-4 text-lg font-semibold">Pricing</h2>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="gymRentalCost"
              className="mb-2 block text-sm font-medium"
            >
              Total Gym Rental Cost (€)
            </label>
            <input
              type="number"
              id="gymRentalCost"
              value={formData.gymRentalCost}
              onChange={(e) =>
                setFormData({ ...formData, gymRentalCost: e.target.value })
              }
              required
              min="0"
              step="0.01"
              placeholder="600.00"
              className="w-full rounded-md border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-800"
            />
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Total cost for all games in this league
            </p>
          </div>

          <div>
            <label
              htmlFor="guestFeePerGame"
              className="mb-2 block text-sm font-medium"
            >
              Guest Fee Per Game (€)
            </label>
            <input
              type="number"
              id="guestFeePerGame"
              value={formData.guestFeePerGame}
              onChange={(e) =>
                setFormData({ ...formData, guestFeePerGame: e.target.value })
              }
              required
              min="0"
              step="0.01"
              placeholder="5.00"
              className="w-full rounded-md border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-800"
            />
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Fee charged to non-members per game
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h2 className="mb-4 text-lg font-semibold">Payment Schedule</h2>

        <div className="mb-4 flex gap-2">
          <div className="flex-1">
            <input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-4 py-2 dark:border-gray-700 dark:bg-gray-800"
            />
          </div>
          <Button type="button" onClick={handleAddDueDate} variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Add Due Date
          </Button>
        </div>

        {formData.paymentDueDates.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            No payment due dates added yet. Add at least one due date.
          </p>
        ) : (
          <div className="space-y-2">
            {formData.paymentDueDates.map((date) => (
              <div
                key={date}
                className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-800"
              >
                <span className="text-sm">
                  {new Date(date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveDueDate(date)}
                  className="text-red-600 hover:text-red-700 dark:text-red-400"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Members will be charged in installments on these dates. The total cost
          will be split equally across all payment dates.
        </p>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : leagueId ? "Update League" : "Create League"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
