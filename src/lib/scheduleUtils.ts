import { League } from "@prisma/client";

/**
 * Schedule generation utilities for League management
 */

export interface RecurringPattern {
  frequency: "DAILY" | "WEEKLY" | "MONTHLY";
  dayOfWeek?: number; // 0-6 (Sunday-Saturday), required for WEEKLY
  time: string; // "HH:MM" format (24-hour)
}

export type ScheduleConfig = {
  scheduleType: "RECURRING" | "CUSTOM";
  startDate?: Date;
  endDate?: Date;
  recurringPattern?: RecurringPattern;
  customDates?: Date[];
};

/**
 * Generate dates based on recurring pattern
 * @param startDate - Start date of the range
 * @param endDate - End date of the range
 * @param pattern - Recurring pattern configuration
 * @returns Array of Date objects for all games in the range
 */
export function generateRecurringDates(
  startDate: Date,
  endDate: Date,
  pattern: RecurringPattern
): Date[] {
  const dates: Date[] = [];
  let current = new Date(startDate);

  // Ensure we start from the beginning of the day
  current.setHours(0, 0, 0, 0);

  while (current <= endDate) {
    let dateToAdd: Date | null = null;

    if (pattern.frequency === "WEEKLY") {
      // Find next occurrence of the specified day of week
      if (pattern.dayOfWeek === undefined) {
        throw new Error("dayOfWeek is required for WEEKLY frequency");
      }

      while (current.getDay() !== pattern.dayOfWeek && current <= endDate) {
        current.setDate(current.getDate() + 1);
      }

      if (current <= endDate) {
        dateToAdd = new Date(current);
      }
    } else if (pattern.frequency === "DAILY") {
      dateToAdd = new Date(current);
    } else if (pattern.frequency === "MONTHLY") {
      // Use the same day of month as start date
      dateToAdd = new Date(current);
    }

    // Apply time to the date
    if (dateToAdd && dateToAdd <= endDate) {
      const [hours, minutes] = pattern.time.split(":").map(Number);
      dateToAdd.setHours(hours, minutes, 0, 0);
      dates.push(dateToAdd);
    }

    // Increment to next occurrence
    if (pattern.frequency === "DAILY") {
      current.setDate(current.getDate() + 1);
    } else if (pattern.frequency === "WEEKLY") {
      current.setDate(current.getDate() + 7);
    } else if (pattern.frequency === "MONTHLY") {
      current.setMonth(current.getMonth() + 1);
    }
  }

  return dates;
}

/**
 * Validate schedule configuration
 * @param scheduleType - Type of schedule (RECURRING or CUSTOM)
 * @param recurringPattern - Recurring pattern (required if scheduleType is RECURRING)
 * @param customDates - Array of custom dates (required if scheduleType is CUSTOM)
 * @returns Object with isValid boolean and optional error message
 */
export function validateScheduleConfig(
  scheduleType: "RECURRING" | "CUSTOM",
  recurringPattern?: RecurringPattern | null,
  customDates?: Date[] | null
): { isValid: boolean; error?: string } {
  if (scheduleType === "RECURRING") {
    if (!recurringPattern) {
      return {
        isValid: false,
        error: "Recurring pattern is required for RECURRING schedule type",
      };
    }

    if (!recurringPattern.time) {
      return { isValid: false, error: "Time is required for recurring pattern" };
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(recurringPattern.time)) {
      return {
        isValid: false,
        error: "Time must be in HH:MM format (24-hour)",
      };
    }

    if (
      recurringPattern.frequency === "WEEKLY" &&
      (recurringPattern.dayOfWeek === undefined ||
        recurringPattern.dayOfWeek < 0 ||
        recurringPattern.dayOfWeek > 6)
    ) {
      return {
        isValid: false,
        error: "Day of week (0-6) is required for WEEKLY frequency",
      };
    }

    if (!["DAILY", "WEEKLY", "MONTHLY"].includes(recurringPattern.frequency)) {
      return {
        isValid: false,
        error: "Frequency must be DAILY, WEEKLY, or MONTHLY",
      };
    }
  }

  if (scheduleType === "CUSTOM") {
    if (!customDates || customDates.length === 0) {
      return {
        isValid: false,
        error: "At least one custom date is required for CUSTOM schedule type",
      };
    }

    // Validate all dates are valid Date objects
    for (const date of customDates) {
      if (!(date instanceof Date) || isNaN(date.getTime())) {
        return { isValid: false, error: "Invalid date in custom dates array" };
      }
    }
  }

  return { isValid: true };
}

/**
 * Format schedule description for display
 * @param league - League object with schedule configuration
 * @returns Human-readable description of the schedule
 */
export function formatScheduleDescription(league: League): string {
  if (league.schedule_type === "RECURRING" && league.recurring_pattern) {
    try {
      const pattern: RecurringPattern = JSON.parse(league.recurring_pattern);

      const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];

      const frequencyMap = {
        DAILY: "Daily",
        WEEKLY:
          pattern.dayOfWeek !== undefined
            ? `Every ${dayNames[pattern.dayOfWeek]}`
            : "Weekly",
        MONTHLY: "Monthly",
      };

      const frequency = frequencyMap[pattern.frequency];
      const time = formatTime(pattern.time);

      return `${frequency} at ${time}`;
    } catch {
      return "Recurring schedule";
    }
  }

  if (league.schedule_type === "CUSTOM" && league.custom_dates) {
    try {
      const dates: string[] = JSON.parse(league.custom_dates);
      const count = dates.length;
      return `${count} custom date${count !== 1 ? "s" : ""}`;
    } catch {
      return "Custom schedule";
    }
  }

  return "No schedule configured";
}

/**
 * Format time from 24-hour to 12-hour format
 * @param time24 - Time in HH:MM format (24-hour)
 * @returns Time in 12-hour format with AM/PM
 */
function formatTime(time24: string): string {
  const [hours, minutes] = time24.split(":").map(Number);

  if (hours === 0) {
    return `12:${minutes.toString().padStart(2, "0")} AM`;
  } else if (hours < 12) {
    return `${hours}:${minutes.toString().padStart(2, "0")} AM`;
  } else if (hours === 12) {
    return `${hours}:${minutes.toString().padStart(2, "0")} PM`;
  } else {
    return `${hours - 12}:${minutes.toString().padStart(2, "0")} PM`;
  }
}

/**
 * Parse custom dates from JSON string
 * @param customDatesJson - JSON string of ISO date strings
 * @returns Array of Date objects
 */
export function parseCustomDates(customDatesJson: string): Date[] {
  try {
    const dateStrings: string[] = JSON.parse(customDatesJson);
    return dateStrings.map((dateStr) => new Date(dateStr));
  } catch {
    return [];
  }
}

/**
 * Parse recurring pattern from JSON string
 * @param recurringPatternJson - JSON string of recurring pattern
 * @returns RecurringPattern object or null if invalid
 */
export function parseRecurringPattern(
  recurringPatternJson: string
): RecurringPattern | null {
  try {
    return JSON.parse(recurringPatternJson) as RecurringPattern;
  } catch {
    return null;
  }
}
