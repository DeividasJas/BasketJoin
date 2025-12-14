"use server";

import { auth } from "@/auth";
import { prisma } from "@/utils/prisma";
import { revalidatePath } from "next/cache";

// Safety limits
const MAX_GAMES = 100;
const MAX_CUSTOM_INTERVAL = 365;

// Helper function to check admin access
async function checkAdminAccess() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Not authenticated");
  }

  const userRole = session.user.role;
  if (userRole !== "ADMIN" && userRole !== "ORGANIZER") {
    throw new Error("Not authorized");
  }

  return session.user.id;
}

// Types
interface RecurrenceConfig {
  pattern: "weekly" | "monthly" | "custom";
  customInterval?: number;
  endType: "count" | "date";
  occurrenceCount?: number;
  endDate?: Date;
}

// Generate recurring dates based on pattern
export async function generateRecurringDates(
  startDate: Date,
  recurrence: RecurrenceConfig,
): Promise<Date[]> {
  const dates: Date[] = [];
  // eslint-disable-next-line prefer-const
  let currentDate = new Date(startDate);

  // Determine how many dates to generate
  let maxIterations = MAX_GAMES;
  if (recurrence.endType === "count" && recurrence.occurrenceCount) {
    maxIterations = Math.min(recurrence.occurrenceCount, MAX_GAMES);
  }

  // Generate dates
  for (let i = 0; i < maxIterations; i++) {
    // Check end date condition
    if (recurrence.endType === "date" && recurrence.endDate) {
      if (currentDate > recurrence.endDate) {
        break;
      }
    }

    dates.push(new Date(currentDate));

    // Calculate next date based on pattern
    if (recurrence.pattern === "weekly") {
      currentDate.setDate(currentDate.getDate() + 7);
    } else if (recurrence.pattern === "monthly") {
      currentDate.setMonth(currentDate.getMonth() + 1);
    } else if (recurrence.pattern === "custom" && recurrence.customInterval) {
      currentDate.setDate(currentDate.getDate() + recurrence.customInterval);
    }
  }

  return dates;
}

// Preview recurring dates (for client-side preview)
export async function previewRecurringDates(
  startDate: Date,
  recurrence: RecurrenceConfig,
) {
  try {
    const dates = await generateRecurringDates(startDate, recurrence);

    return {
      success: true,
      dates,
      count: dates.length,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to generate preview",
      dates: [],
      count: 0,
    };
  }
}

// Check for conflicts with existing games
export async function checkRecurringConflicts(
  dates: Date[],
  locationId: number,
) {
  try {
    const conflicts = await prisma.games.findMany({
      where: {
        location_id: locationId,
        game_date: {
          in: dates,
        },
      },
      select: {
        id: true,
        game_date: true,
      },
    });

    return {
      success: true,
      conflicts,
      hasConflicts: conflicts.length > 0,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to check conflicts",
      conflicts: [],
      hasConflicts: false,
    };
  }
}

// Create recurring games
export async function createRecurringGames(data: {
  seriesName: string;
  game_date: Date;
  location_id: number;
  max_players?: number;
  min_players?: number;
  description?: string;
  game_type?: string;
  recurrence: RecurrenceConfig;
}) {
  try {
    const userId = await checkAdminAccess();

    // Validate series name
    if (!data.seriesName || data.seriesName.trim().length === 0) {
      return {
        success: false,
        message: "Series name is required",
        createdCount: 0,
        skippedGames: [],
      };
    }

    if (data.seriesName.length > 50) {
      return {
        success: false,
        message: "Series name must be 50 characters or less",
        createdCount: 0,
        skippedGames: [],
      };
    }

    // Validate custom interval
    if (
      data.recurrence.pattern === "custom" &&
      data.recurrence.customInterval
    ) {
      if (
        data.recurrence.customInterval < 1 ||
        data.recurrence.customInterval > MAX_CUSTOM_INTERVAL
      ) {
        return {
          success: false,
          message: `Custom interval must be between 1 and ${MAX_CUSTOM_INTERVAL} days`,
          createdCount: 0,
          skippedGames: [],
        };
      }
    }

    // Generate dates
    const generatedDates = await generateRecurringDates(
      data.game_date,
      data.recurrence,
    );

    if (generatedDates.length === 0) {
      return {
        success: false,
        message: "No games generated. Check your recurrence settings.",
        createdCount: 0,
        skippedGames: [],
      };
    }

    if (generatedDates.length > MAX_GAMES) {
      return {
        success: false,
        message: `Cannot create more than ${MAX_GAMES} games at once`,
        createdCount: 0,
        skippedGames: [],
      };
    }

    // Create series first
    const series = await prisma.series.create({
      data: {
        name: data.seriesName.trim(),
      },
    });

    // Create games in transaction
    const created: any[] = [];
    const skipped: any[] = [];

    await prisma.$transaction(async (tx) => {
      for (const date of generatedDates) {
        try {
          const game = await tx.games.create({
            data: {
              game_date: date,
              location_id: data.location_id,
              max_players: data.max_players,
              min_players: data.min_players || 10,
              description: data.description,
              game_type: data.game_type,
              organizer_id: userId,
              series_id: series.id,
              status: "SCHEDULED",
            },
          });
          created.push(game);
        } catch (error: any) {
          // P2002 is Prisma's unique constraint violation code
          if (error.code === "P2002") {
            skipped.push({
              date,
              reason: "Game already exists at this time and location",
            });
          } else {
            // Other errors should rollback the transaction
            throw error;
          }
        }
      }
    });

    // Revalidate paths
    revalidatePath("/dashboard/games");
    revalidatePath("/schedule");

    // Build success message
    let message = `Successfully created ${created.length} out of ${generatedDates.length} games`;
    if (skipped.length > 0) {
      message += `. Skipped ${skipped.length} conflicting game(s)`;
    }

    return {
      success: true,
      message,
      createdCount: created.length,
      skippedGames: skipped,
      seriesId: series.id,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to create recurring games",
      createdCount: 0,
      skippedGames: [],
    };
  }
}

// Update series games (for editing a game in a series)
export async function updateSeriesGames(
  gameId: number,
  seriesId: string,
  updates: {
    game_date?: Date;
    location_id?: number;
    max_players?: number;
    min_players?: number;
    description?: string;
    game_type?: string;
  },
  updateFutureGames: boolean = false,
) {
  try {
    await checkAdminAccess();

    if (!updateFutureGames) {
      // Update single game only - use existing updateGame logic
      const game = await prisma.games.update({
        where: { id: gameId },
        data: updates,
        include: {
          location: true,
        },
      });

      revalidatePath("/dashboard/games");
      revalidatePath("/schedule");
      revalidatePath(`/game-status/${gameId}`);

      return {
        success: true,
        message: "Game updated successfully",
        game,
      };
    }

    // Get the edited game's date
    const editedGame = await prisma.games.findUnique({
      where: { id: gameId },
    });

    if (!editedGame) {
      return {
        success: false,
        message: "Game not found",
      };
    }

    // Update this game and all future games in series
    await prisma.$transaction([
      // Update the current game
      prisma.games.update({
        where: { id: gameId },
        data: updates,
      }),
      // Update all future games in series
      prisma.games.updateMany({
        where: {
          series_id: seriesId,
          game_date: { gt: editedGame.game_date },
          status: { in: ["SCHEDULED"] },
        },
        data: updates,
      }),
    ]);

    revalidatePath("/dashboard/games");
    revalidatePath("/schedule");

    return {
      success: true,
      message: "Updated game and all future games in series",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to update series games",
    };
  }
}

// Delete series games (preserving past games)
export async function deleteSeriesGames(
  seriesId: string,
  preservePastGames: boolean = true,
) {
  try {
    await checkAdminAccess();

    const whereClause: any = {
      series_id: seriesId,
    };

    if (preservePastGames) {
      // Only delete future games (game_date >= now)
      whereClause.game_date = { gte: new Date() };
    }

    // Get games to be deleted (for notifications)
    const gamesToDelete = await prisma.games.findMany({
      where: whereClause,
      include: {
        game_registrations: {
          where: { status: "CONFIRMED" },
        },
        location: true,
      },
    });

    if (gamesToDelete.length === 0) {
      return {
        success: true,
        message: "No games found to delete",
        deletedCount: 0,
      };
    }

    // Delete games and create notifications
    await prisma.$transaction(async (tx) => {
      // Delete games
      await tx.games.deleteMany({
        where: whereClause,
      });

      // Notify registered players
      const notifications = gamesToDelete.flatMap((game) =>
        game.game_registrations.map((reg) => ({
          user_id: reg.user_id,
          type: "GAME_CANCELLED",
          message: `Series game on ${game.game_date.toLocaleDateString()} at ${game.location.name} has been deleted`,
        })),
      );

      if (notifications.length > 0) {
        await tx.notification.createMany({ data: notifications });
      }
    });

    revalidatePath("/dashboard/games");
    revalidatePath("/schedule");

    return {
      success: true,
      message: `Deleted ${gamesToDelete.length} future game(s) from series`,
      deletedCount: gamesToDelete.length,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to delete series games",
      deletedCount: 0,
    };
  }
}

// Check if a game has future games in its series
export async function checkFutureGamesInSeries(
  gameId: number,
  seriesId: string,
) {
  try {
    const game = await prisma.games.findUnique({
      where: { id: gameId },
    });

    if (!game) {
      return {
        success: false,
        hasFutureGames: false,
        futureGamesCount: 0,
      };
    }

    const futureGamesCount = await prisma.games.count({
      where: {
        series_id: seriesId,
        game_date: { gt: game.game_date },
        status: "SCHEDULED",
      },
    });

    return {
      success: true,
      hasFutureGames: futureGamesCount > 0,
      futureGamesCount,
    };
  } catch (error: any) {
    return {
      success: false,
      hasFutureGames: false,
      futureGamesCount: 0,
    };
  }
}

// Get all games in a series
export async function getSeriesGames(seriesId: string) {
  try {
    await checkAdminAccess();

    const games = await prisma.games.findMany({
      where: {
        series_id: seriesId,
      },
      include: {
        location: true,
        _count: {
          select: {
            game_registrations: {
              where: {
                status: "CONFIRMED",
              },
            },
          },
        },
      },
      orderBy: {
        game_date: "asc",
      },
    });

    return {
      success: true,
      games,
      count: games.length,
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Failed to fetch series games",
      games: [],
      count: 0,
    };
  }
}
