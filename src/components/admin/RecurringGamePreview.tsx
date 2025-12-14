"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface ConflictGame {
  id: number;
  game_date: Date;
}

interface RecurringGamePreviewProps {
  dates: Date[];
  conflicts: ConflictGame[];
  locationName: string;
}

export default function RecurringGamePreview({
  dates,
  conflicts,
  locationName,
}: RecurringGamePreviewProps) {
  const [showAllDates, setShowAllDates] = useState(false);

  if (dates.length === 0) {
    return null;
  }

  const conflictDates = new Set(
    conflicts.map((c) => new Date(c.game_date).toISOString())
  );

  const hasConflicts = conflicts.length > 0;
  const displayDates = showAllDates ? dates : dates.slice(0, 5);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isConflict = (date: Date) => {
    return conflictDates.has(new Date(date).toISOString());
  };

  return (
    <div className="mt-4 rounded-lg border bg-zinc-50 p-4 dark:bg-zinc-900">
      <div className="mb-3">
        <h3 className="font-semibold text-lg">Preview Recurring Games</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {dates.length} game{dates.length !== 1 ? "s" : ""} will be created at{" "}
          <span className="font-medium">{locationName}</span>
        </p>
      </div>

      {/* Conflict Warning */}
      {hasConflicts && (
        <div className="mb-3 flex items-start gap-2 rounded-md border border-orange-400 bg-orange-50 p-3 dark:bg-orange-950/30">
          <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-orange-800 dark:text-orange-300">
              {conflicts.length} conflict{conflicts.length !== 1 ? "s" : ""}{" "}
              detected
            </p>
            <p className="text-orange-700 dark:text-orange-400">
              Conflicting games will be skipped during creation
            </p>
          </div>
        </div>
      )}

      {/* Dates List */}
      <div className="space-y-1.5">
        {displayDates.map((date, index) => {
          const conflict = isConflict(date);
          return (
            <div
              key={index}
              className={`flex items-center gap-2 rounded px-2 py-1.5 text-sm ${
                conflict
                  ? "bg-orange-100 dark:bg-orange-950/40"
                  : "bg-green-50 dark:bg-green-950/20"
              }`}
            >
              {conflict ? (
                <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
              )}
              <span
                className={
                  conflict
                    ? "text-orange-900 dark:text-orange-200"
                    : "text-gray-900 dark:text-gray-100"
                }
              >
                {formatDate(date)}
              </span>
              {conflict && (
                <span className="ml-auto text-xs text-orange-600 dark:text-orange-400">
                  Already exists
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Show More Button */}
      {dates.length > 5 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowAllDates(!showAllDates)}
          className="mt-3 w-full"
        >
          {showAllDates
            ? "Show less"
            : `View all ${dates.length} dates`}
        </Button>
      )}
    </div>
  );
}
