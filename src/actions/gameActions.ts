"use server";
import { prisma } from "@/utils/prisma";
import { findCurrentUser, getUserId } from "./userActions";
import { CancelRegistration, RegisterToGameResult } from "@/types/prismaTypes";
import { revalidatePath } from "next/cache";

export const getGameByIdAndLocation = async (
  gameId: number,
  locationId: number = 1,
) => {
  const user_id = await getUserId();

  try {
    const gameObject = await prisma.games.findUnique({
      where: {
        id: gameId,
        location_id: locationId,
      },
      include: {
        location: {
          select: {
            id: true,
            name: true,
          },
        },
        game_registrations: {
          include: {
            user: true,
          },
          orderBy: {
            user: {
              created_at: "asc",
            },
          },
        },
      },
    });
    if (!gameObject) return { success: false, message: "Game not found" };

    const participantsData = gameObject.game_registrations.map(
      (registration) => registration.user,
    );

    const isActivePlayer = participantsData.some((participant) => {
      return participant.id === user_id;
    });

    return {
      success: true,
      isActivePlayer,
      participantsData,
      gameData: {
        game_date: gameObject.game_date,
        game_id: gameObject.id,
        location: gameObject.location,
      },
    };
  } catch (error: any) {
    console.error(error.message);
    return { success: false, message: error.message };
  }
};

export const getFirstGameByLocationId = async (locationId: number) => {
  const user_id = await getUserId();

  try {
    const gameObject = await prisma.games.findFirst({
      where: {
        location_id: locationId,
        game_date: {
          gte: new Date(),
        },
      },
      include: {
        location: {
          select: {
            id: true,
            name: true,
          },
        },
        game_registrations: {
          include: {
            user: true,
          },
          orderBy: {
            user: {
              created_at: "asc",
            },
          },
        },
      },
    });

    if (!gameObject) return { success: false, message: "Game not found" };

    const participantsData = gameObject.game_registrations.map(
      (registration) => registration.user,
    );

    if (!user_id) {
      return {
        success: true,
        participantsData,
        gameData: {
          game_date: gameObject.game_date,
          game_id: gameObject.id,
          location: gameObject.location,
        },
      };
    }

    const isActivePlayer = participantsData.some((participant) => {
      return participant.id === user_id;
    });

    return {
      success: true,
      isActivePlayer,
      participantsData,
      gameData: {
        game_date: gameObject.game_date,
        game_id: gameObject.id,
        location: gameObject.location,
      },
    };
  } catch (error: any) {
    console.error(error.message);
    return { success: false, message: error.message };
  }
};

export const registerToGame = async (
  gameId: number,
): Promise<RegisterToGameResult> => {
  try {
    const user_id = await getUserId();

    const testFindGame = await prisma.games.findUnique({
      where: {
        id: gameId,
      },
      select: {
        id: true,
      },
    });

    if (!testFindGame) return { success: false, message: "No games found" };

    const existingRegistration = await prisma.game_registrations.findFirst({
      where: {
        user_id: user_id,
        game_id: testFindGame?.id,
      },
    });

    if (existingRegistration)
      return {
        success: true,
        message: "You are already registered for this game",
      };

    const { user } = await findCurrentUser();

    if (!user) return { success: false, message: "User not found" };

    const newRegistration = await prisma.game_registrations.create({
      data: {
        user_id: user?.id,
        game_id: gameId,
      },
    });
    if (!newRegistration)
      return { success: false, message: "Registration failed" };

    revalidatePath("/schedule");
    revalidatePath(`/game-status/${gameId}`);

    return {
      success: true,
      message: "Registration successful",
      registration: newRegistration,
    };
  } catch (error: any) {
    console.error(error.message);
    return { success: false, message: error.message };
  }
};

export const cancelRegistration = async (
  gameId: number,
): Promise<CancelRegistration> => {
  try {
    const userId = await getUserId();

    if (!userId) {
      return { success: false, message: "User not found" };
    }

    const registration = await prisma.game_registrations.delete({
      where: {
        user_id_game_id: {
          user_id: userId,
          game_id: gameId,
        },
      },
    });

    if (!registration)
      return { success: false, message: "Registration not found" };

    revalidatePath("/schedule");
    revalidatePath(`/game-status/${gameId}`);

    return {
      success: true,
      message: "Registration canceled",
      registration,
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error((error as Error).message);
      return { success: false, message: "Registration not found" };
    }
    return { success: false, message: "Registration not found" };
  }
};

export const lastTenGamesFromUserRegistration = async () => {
  try {
    const { user, success } = await findCurrentUser();

    if (!success) return { success: false, message: "User not found" };

    const lastTenGames = await prisma.games.findMany({
      take: 10,
      where: {
        game_date: {
          gte: user?.created_at,
          lte: new Date(),
        },
      },
      include: {
        game_registrations: true,
      },
    });

    if (!lastTenGames) return { success: false, message: "No games found" };
    return { success: true, lastTenGames, user };
  } catch (error: any) {
    console.error(error.message);
    return { success: false, message: error.message };
  }
};

export const getAllGames = async () => {
  try {
    const allGames = await prisma.games.findMany({
      orderBy: {
        game_date: "asc",
      },
      include: { location: true, game_registrations: true },
    });

    if (!allGames) return { success: false, message: "No games found" };

    return { success: true, allGames };
  } catch (error: any) {
    console.error(error.message);
    return { success: false, message: error.message };
  }
};
