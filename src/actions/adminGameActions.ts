"use server";

import { auth } from "@/auth";
import { prisma } from "@/utils/prisma";
import { revalidatePath } from "next/cache";

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

// Create new game
export async function createGame(data: {
  game_date: Date;
  location_id: number;
  max_players?: number;
  min_players?: number;
  description?: string;
  game_type?: string;
}) {
  try {
    const userId = await checkAdminAccess();

    const game = await prisma.games.create({
      data: {
        game_date: data.game_date,
        location_id: data.location_id,
        max_players: data.max_players,
        min_players: data.min_players || 10,
        description: data.description,
        game_type: data.game_type,
        organizer_id: userId,
        status: "SCHEDULED",
      },
      include: {
        location: true,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/schedule");

    return {
      success: true,
      message: "Game created successfully",
      game,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to create game",
    };
  }
}

// Update game details
export async function updateGame(
  gameId: number,
  data: {
    game_date?: Date;
    location_id?: number;
    max_players?: number;
    min_players?: number;
    description?: string;
    game_type?: string;
  }
) {
  try {
    await checkAdminAccess();

    const game = await prisma.games.update({
      where: { id: gameId },
      data,
      include: {
        location: true,
        game_registrations: {
          include: {
            user: true,
          },
        },
      },
    });

    revalidatePath("/admin");
    revalidatePath("/schedule");
    revalidatePath(`/game-status/${gameId}`);

    return {
      success: true,
      message: "Game updated successfully",
      game,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to update game",
    };
  }
}

// Cancel game (with notifications)
export async function cancelGame(gameId: number, reason?: string) {
  try {
    await checkAdminAccess();

    // Get all registered players
    const registrations = await prisma.game_registrations.findMany({
      where: {
        game_id: gameId,
        status: "CONFIRMED",
      },
      include: {
        user: true,
      },
    });

    // Update game status
    const game = await prisma.games.update({
      where: { id: gameId },
      data: { status: "CANCELLED" },
      include: {
        location: true,
      },
    });

    // Create notifications for all registered players
    const notificationMessage = reason
      ? `Game on ${new Date(game.game_date).toLocaleDateString()} at ${game.location.name} has been cancelled. Reason: ${reason}`
      : `Game on ${new Date(game.game_date).toLocaleDateString()} at ${game.location.name} has been cancelled.`;

    await prisma.notification.createMany({
      data: registrations.map((reg) => ({
        user_id: reg.user_id,
        game_id: gameId,
        type: "GAME_CANCELLED",
        message: notificationMessage,
      })),
    });

    revalidatePath("/admin");
    revalidatePath("/schedule");
    revalidatePath(`/game-status/${gameId}`);

    return {
      success: true,
      message: `Game cancelled. ${registrations.length} players notified.`,
      game,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to cancel game",
    };
  }
}

// Reschedule game (quick change date/time)
export async function rescheduleGame(gameId: number, newDate: Date) {
  try {
    await checkAdminAccess();

    // Get all registered players
    const registrations = await prisma.game_registrations.findMany({
      where: {
        game_id: gameId,
        status: "CONFIRMED",
      },
    });

    // Update game date
    const game = await prisma.games.update({
      where: { id: gameId },
      data: { game_date: newDate },
      include: {
        location: true,
      },
    });

    // Notify all registered players
    const notificationMessage = `Game has been rescheduled to ${new Date(newDate).toLocaleString()} at ${game.location.name}`;

    await prisma.notification.createMany({
      data: registrations.map((reg) => ({
        user_id: reg.user_id,
        game_id: gameId,
        type: "GAME_RESCHEDULED",
        message: notificationMessage,
      })),
    });

    revalidatePath("/admin");
    revalidatePath("/schedule");
    revalidatePath(`/game-status/${gameId}`);

    return {
      success: true,
      message: `Game rescheduled. ${registrations.length} players notified.`,
      game,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to reschedule game",
    };
  }
}

// Change location
export async function changeGameLocation(
  gameId: number,
  newLocationId: number
) {
  try {
    await checkAdminAccess();

    // Get all registered players
    const registrations = await prisma.game_registrations.findMany({
      where: {
        game_id: gameId,
        status: "CONFIRMED",
      },
    });

    // Update location
    const game = await prisma.games.update({
      where: { id: gameId },
      data: { location_id: newLocationId },
      include: {
        location: true,
      },
    });

    // Notify all registered players
    const notificationMessage = `Game location has been changed to ${game.location.name} (${game.location.address})`;

    await prisma.notification.createMany({
      data: registrations.map((reg) => ({
        user_id: reg.user_id,
        game_id: gameId,
        type: "GAME_LOCATION_CHANGED",
        message: notificationMessage,
      })),
    });

    revalidatePath("/admin");
    revalidatePath("/schedule");
    revalidatePath(`/game-status/${gameId}`);

    return {
      success: true,
      message: `Location changed. ${registrations.length} players notified.`,
      game,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to change location",
    };
  }
}

// Mark as completed
export async function markGameAsCompleted(gameId: number) {
  try {
    await checkAdminAccess();

    const game = await prisma.games.update({
      where: { id: gameId },
      data: { status: "COMPLETED" },
      include: {
        location: true,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/schedule");
    revalidatePath(`/game-status/${gameId}`);

    return {
      success: true,
      message: "Game marked as completed",
      game,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to mark game as completed",
    };
  }
}

// Delete game (permanently)
export async function deleteGame(gameId: number) {
  try {
    await checkAdminAccess();

    // Delete all related registrations and notifications first
    await prisma.game_registrations.deleteMany({
      where: { game_id: gameId },
    });

    await prisma.notification.deleteMany({
      where: { game_id: gameId },
    });

    // Delete the game
    await prisma.games.delete({
      where: { id: gameId },
    });

    revalidatePath("/admin");
    revalidatePath("/schedule");

    return {
      success: true,
      message: "Game deleted successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to delete game",
    };
  }
}

// Get all games for admin view
export async function getAllGamesForAdmin() {
  try {
    await checkAdminAccess();

    const games = await prisma.games.findMany({
      include: {
        location: true,
        organizer: {
          select: {
            given_name: true,
            family_name: true,
            email: true,
          },
        },
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
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch games",
      games: [],
    };
  }
}

// Get all locations
export async function getAllLocations() {
  try {
    const locations = await prisma.locations.findMany({
      where: {
        is_active: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return {
      success: true,
      locations,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to fetch locations",
      locations: [],
    };
  }
}
