"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { rescheduleGame } from "@/actions/adminGameActions";

export default function RescheduleForm({
  gameId,
  currentDate,
  playerCount,
}: {
  gameId: number;
  currentDate: Date;
  playerCount: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [newDate, setNewDate] = useState(
    new Date(currentDate).toISOString().slice(0, 16)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await rescheduleGame(gameId, new Date(newDate));

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
          players</strong> about the schedule change.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          New Date and Time <span className="text-red-500">*</span>
        </label>
        <input
          type="datetime-local"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          required
          className="w-full px-4 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Rescheduling..." : "Reschedule Game"}
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
