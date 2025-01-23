"use server";
import { prisma } from "@/utils/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";


const startOfWeek = new Date();
startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
startOfWeek.setHours(0, 0, 0, 0);

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { get } from "http";
import { findCurrentUser, findUser } from "./userActions";
import { getUserId } from "@/lib/serverUtils";
const { getUser } = getKindeServerSession();
export const getLatestGameByLocation = async (locationId: number) => {
  try {
    const user_id = await getUserId();

    const gameObj = await prisma.games.findFirst({
      where: {
        game_date: {
          gte: new Date(),
        },
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
        },
      },
    });

    if (!gameObj) return { success: false, message: "No games found" };

    const participants = gameObj.game_registrations.map(
      (registration) => registration.user,
    );

    const isActive = participants.some(
      (participant: any) => participant.id === user_id,
    );

    const latestGameWithPLayers = {
      isActive,
      participants,
      game: {
        game_date: gameObj.game_date,
        game_id: gameObj.id,
        location: gameObj.location,
      },
    };

    return { success: true, latestGameWithPLayers };
  } catch (error: any) {
    console.error({ success: false, message: error.message });
    return { success: false, message: error.message };
  }
};

export const getGameByIdAndLocation = async (
  gameId: number,
  locationId: number,
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
        },
      },
    });
    if (!gameObject) return { success: false, message: "Game not found" };

    const participants = gameObject.game_registrations.map((registration) => {
      return registration.user;
    });

    const isActive = participants.some((participant) => {
      return participant.id === user_id;
    });

    const gameWithPLayers = {
      isActive,
      participants,
      game: {
        game_date: gameObject.game_date,
        game_id: gameObject.id,
        location: gameObject.location,
      },
    };

    return { success: true, gameWithPLayers };
  } catch (error: any) {
    console.error({ success: false, message: error.message });
    return { success: false, message: error.message };
  }
};

export const registerToGame = async (gameId: number) => {
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
        family_name: user?.family_name,
        given_name: user?.given_name,
        game_id: gameId,
      },
    });
    if (!newRegistration)
      return { success: false, message: "Registration failed" };

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

export const cancelRegistration = async ({ gameId }: { gameId: number }) => {
  try {
    const cookieStore = await cookies();
    let userId = cookieStore.get("user_id")?.value;

    if (!userId) {
      userId = kindeUser?.id;
    }

    const registration = await prisma.game_registrations.delete({
      where: {
        user_id_game_id: {
          user_id: userId,
          game_id: gameId,
        },
      },
    });
    // revalidatePath('/status')
    return { success: true, registration };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error((error as Error).message);
      return { success: false, message: "Registration not found" };
    }
  }
};
