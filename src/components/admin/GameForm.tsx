"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createGame, updateGame } from "@/actions/adminGameActions";
import {
  previewRecurringDates,
  checkRecurringConflicts,
  createRecurringGames,
} from "@/actions/recurringGameActions";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import RecurringGamePreview from "./RecurringGamePreview";
import { formatInTimeZone } from "date-fns-tz";

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
  series_id: string | null;
};

type GameFormProps = {
  locations: Location[];
  mode: "create" | "edit";
  game?: Game;
};

export default function GameForm({ locations, mode, game }: GameFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [applyToSeries, setApplyToSeries] = useState(false);

  // Initialize form with game data or defaults
  const [formData, setFormData] = useState({
    game_date: game
      ? formatInTimeZone(game.game_date, "UTC", "yyyy-MM-dd'T'HH:mm")
      : "",
    location_id: game?.location_id.toString() || "",
    max_players: game?.max_players?.toString() || "",
    min_players: game?.min_players.toString() || "10",
    description: game?.description || "",
    game_type: game?.game_type || "",
  });

  // Recurring game state (only for create mode)
  const [isRecurring, setIsRecurring] = useState(false);
  const [seriesName, setSeriesName] = useState("");
  const [recurrencePattern, setRecurrencePattern] = useState<
    "weekly" | "monthly" | "custom"
  >("weekly");
  const [customInterval, setCustomInterval] = useState("7");
  const [endType, setEndType] = useState<"count" | "date">("count");
  const [occurrenceCount, setOccurrenceCount] = useState("4");
  const [endDate, setEndDate] = useState("");
  const [previewDates, setPreviewDates] = useState<Date[]>([]);
  const [conflicts, setConflicts] = useState<any[]>([]);

  // Generate preview when recurring options change
  useEffect(() => {
    if (!isRecurring || mode !== "create" || !formData.game_date || !formData.location_id) {
      setPreviewDates([]);
      setConflicts([]);
      return;
    }

    const generatePreview = async () => {
      const result = await previewRecurringDates(new Date(formData.game_date), {
        pattern: recurrencePattern,
        customInterval: recurrencePattern === "custom" ? parseInt(customInterval) : undefined,
        endType,
        occurrenceCount: endType === "count" ? parseInt(occurrenceCount) : undefined,
        endDate: endType === "date" && endDate ? new Date(endDate) : undefined,
      });

      if (result.success && result.dates.length > 0) {
        setPreviewDates(result.dates);

        // Check for conflicts
        const conflictCheck = await checkRecurringConflicts(
          result.dates,
          parseInt(formData.location_id)
        );

        if (conflictCheck.success) {
          setConflicts(conflictCheck.conflicts);
        }
      }
    };

    generatePreview();
  }, [
    isRecurring,
    formData.game_date,
    formData.location_id,
    recurrencePattern,
    customInterval,
    endType,
    occurrenceCount,
    endDate,
    mode,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRecurring && mode === "create") {
        // Validate series name
        if (!seriesName.trim()) {
          toast.error("Series name is required for recurring games");
          setLoading(false);
          return;
        }

        // Recurring game creation
        const result = await createRecurringGames({
          seriesName: seriesName.trim(),
          game_date: new Date(formData.game_date),
          location_id: parseInt(formData.location_id),
          max_players: formData.max_players
            ? parseInt(formData.max_players)
            : undefined,
          min_players: parseInt(formData.min_players),
          description: formData.description || undefined,
          game_type: formData.game_type || undefined,
          recurrence: {
            pattern: recurrencePattern,
            customInterval:
              recurrencePattern === "custom"
                ? parseInt(customInterval)
                : undefined,
            endType,
            occurrenceCount:
              endType === "count" ? parseInt(occurrenceCount) : undefined,
            endDate: endType === "date" && endDate ? new Date(endDate) : undefined,
          },
        });

        if (result.success) {
          toast.success(result.message);
          router.push("/dashboard/games");
        } else {
          toast.error(result.message);
        }
      } else {
        // Single game creation or edit
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
            : await updateGame(game!.id, data, applyToSeries);

        if (result.success) {
          toast.success(result.message);
          router.push("/dashboard/games");
        } else {
          toast.error(result.message);
        }
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
          Date and Time (UTC) <span className="text-red-500">*</span>
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

      {/* Recurring Game Toggle (only in create mode) */}
      {mode === "create" && (
        <div className="flex items-center space-x-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-4">
          <Switch
            id="recurring-toggle"
            checked={isRecurring}
            onCheckedChange={setIsRecurring}
          />
          <label htmlFor="recurring-toggle" className="cursor-pointer font-medium">
            Make this a recurring game
          </label>
        </div>
      )}

      {mode === "edit" && game?.series_id && (
        <div className="flex items-center space-x-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-4">
          <Switch
            id="series-update-toggle"
            checked={applyToSeries}
            onCheckedChange={setApplyToSeries}
          />
          <label
            htmlFor="series-update-toggle"
            className="cursor-pointer font-medium"
          >
            Apply to all subsequent games in the series
          </label>
        </div>
      )}

      {/* Recurring Options */}
      {isRecurring && mode === "create" && (
        <div className="space-y-4 rounded-lg border border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950/30 p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100">
            Recurring Schedule
          </h3>

          {/* Series Name */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Series Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={seriesName}
              onChange={(e) => setSeriesName(e.target.value)}
              maxLength={50}
              placeholder="e.g., Monday Night Basketball"
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              {seriesName.length}/50 characters
            </p>
          </div>

          {/* Pattern Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Repeat Pattern <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="pattern"
                  value="weekly"
                  checked={recurrencePattern === "weekly"}
                  onChange={(e) =>
                    setRecurrencePattern(e.target.value as "weekly" | "monthly" | "custom")
                  }
                  className="h-4 w-4"
                />
                <span className="text-sm">Weekly</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="pattern"
                  value="monthly"
                  checked={recurrencePattern === "monthly"}
                  onChange={(e) =>
                    setRecurrencePattern(e.target.value as "weekly" | "monthly" | "custom")
                  }
                  className="h-4 w-4"
                />
                <span className="text-sm">Monthly</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="pattern"
                  value="custom"
                  checked={recurrencePattern === "custom"}
                  onChange={(e) =>
                    setRecurrencePattern(e.target.value as "weekly" | "monthly" | "custom")
                  }
                  className="h-4 w-4"
                />
                <span className="text-sm">Custom</span>
              </label>
            </div>
          </div>

          {/* Custom Interval */}
          {recurrencePattern === "custom" && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Repeat every (days) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={customInterval}
                onChange={(e) => setCustomInterval(e.target.value)}
                min="1"
                max="365"
                required
                className="w-full px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Between 1 and 365 days
              </p>
            </div>
          )}

          {/* End Type Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Ends <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="endType"
                  value="count"
                  checked={endType === "count"}
                  onChange={(e) => setEndType(e.target.value as "count" | "date")}
                  className="h-4 w-4"
                />
                <span className="text-sm">After X occurrences</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="endType"
                  value="date"
                  checked={endType === "date"}
                  onChange={(e) => setEndType(e.target.value as "count" | "date")}
                  className="h-4 w-4"
                />
                <span className="text-sm">On date</span>
              </label>
            </div>
          </div>

          {/* Occurrence Count */}
          {endType === "count" && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Number of games <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={occurrenceCount}
                onChange={(e) => setOccurrenceCount(e.target.value)}
                min="1"
                max="100"
                required
                className="w-full px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Maximum 100 games
              </p>
            </div>
          )}

          {/* End Date */}
          {endType === "date" && (
            <div>
              <label className="block text-sm font-medium mb-2">
                End date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={formData.game_date ? formData.game_date.split("T")[0] : ""}
                required
                className="w-full px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Preview */}
          {previewDates.length > 0 && (
            <RecurringGamePreview
              dates={previewDates}
              conflicts={conflicts}
              locationName={
                locations.find((l) => l.id === parseInt(formData.location_id))?.name || ""
              }
            />
          )}
        </div>
      )}

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
        <Button
          type="submit"
          isLoading={loading}
          className="flex-1"
        >
          {mode === "create" ? "Create Game" : "Update Game"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
