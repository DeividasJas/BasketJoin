"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar, X } from "lucide-react";
import { toast } from "sonner";
import { createSeason, updateSeason } from "@/actions/seasonActions";

interface SeasonFormProps {
  seriesId?: string;
  seasonId?: string;
  initialData?: {
    name: string;
    seriesId: string;
    startDate: string;
    endDate: string;
    gymRentalCost: number;
    guestFeePerGame: number;
    paymentDueDates: string[];
  };
  allSeries: Array<{ id: string; name: string }>;
}

export default function SeasonForm({
  seriesId,
  seasonId,
  initialData,
  allSeries,
}: SeasonFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    seriesId: initialData?.seriesId || seriesId || "",
    startDate: initialData?.startDate || "",
    endDate: initialData?.endDate || "",
    gymRentalCost: initialData?.gymRentalCost
      ? (initialData.gymRentalCost / 100).toString()
      : "",
    guestFeePerGame: initialData?.guestFeePerGame
      ? (initialData.guestFeePerGame / 100).toString()
      : "",
    paymentDueDates: initialData?.paymentDueDates || [],
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
      if (!formData.seriesId) {
        toast.error("Please select a series");
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

      if (seasonId) {
        // Update existing season
        const result = await updateSeason(seasonId, {
          name: formData.name,
          startDate: new Date(formData.startDate),
          endDate: new Date(formData.endDate),
          gymRentalCost: gymRentalCents,
          guestFeePerGame: guestFeeCents,
          paymentDueDates: formData.paymentDueDates,
        });

        if (result.success) {
          toast.success(result.message);
          router.push(`/dashboard/leagues/${seasonId}`);
        } else {
          toast.error(result.message);
        }
      } else {
        // Create new season
        const result = await createSeason({
          seriesId: formData.seriesId,
          name: formData.name,
          startDate: new Date(formData.startDate),
          endDate: new Date(formData.endDate),
          gymRentalCost: gymRentalCents,
          guestFeePerGame: guestFeeCents,
          paymentDueDates: formData.paymentDueDates,
        });

        if (result.success && result.season) {
          toast.success(result.message);
          router.push(`/dashboard/leagues/${result.season.id}`);
        } else {
          toast.error(result.message);
        }
      }
    } catch (error) {
      console.error("Error submitting season:", error);
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
              htmlFor="seriesId"
              className="mb-2 block text-sm font-medium"
            >
              Series
            </label>
            <select
              id="seriesId"
              value={formData.seriesId}
              onChange={(e) =>
                setFormData({ ...formData, seriesId: e.target.value })
              }
              required
              disabled={!!seasonId || !!seriesId}
              className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2 dark:border-zinc-700 dark:bg-zinc-800"
            >
              <option value="">Select a series</option>
              {allSeries.map((series) => (
                <option key={series.id} value={series.id}>
                  {series.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium">
              Season Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              placeholder="e.g., Winter 2025, Q1 2025"
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
              Total cost for all games in this season
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
          {loading ? "Saving..." : seasonId ? "Update Season" : "Create Season"}
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
