"use server";
import { prisma } from "@/utils/prisma";
// import { revalidatePath } from "next/cache";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

const { getUser } = getKindeServerSession();

const kindeUser = await getUser();

const startOfWeek = new Date();
startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
startOfWeek.setHours(0, 0, 0, 0);

const endOfWeek = new Date(startOfWeek);
endOfWeek.setDate(startOfWeek.getDate() + 6);
endOfWeek.setHours(23, 59, 59, 999);

export const getAllUserGames = async () => {
  try {
    const userPlayedGames = await prisma.game_registrations.findMany({
      where: {
        user_id: kindeUser?.id,
      },
      include: {
        game: true,
      },
    });

    if (!userPlayedGames) return { success: false, message: "No games found" };

    return { success: true, userPlayedGames };
  } catch (error: any) {
    console.error(error.message);
    return { success: false, message: error.message };
  }
};

export const getUserById = async (userId: string) => {
  // console.log("USERID", userId);
  // console.log("end week", endOfWeek);
  const user = await prisma.users.findUnique({
    where: {
      id: userId,
    },
  });
  return { success: true, user };
};

export const getLatestGame = async () => {
  try {
    const latestGame = await prisma.games.findFirst({
      where: {
        game_date: {
          gte: new Date(),
          // lte: "2025-01-22T21:59:59.999Z", // change this to endOfWeek
        },
      },
      select: {
        id: true,
        game_date: true,
        game_registrations: true,
      },
      orderBy: {
        game_date: "asc",
      },
    });

    if (!latestGame || !latestGame.id) return { success: false };
    return { success: true, latestGame };
  } catch (error) {
    console.error("Error fetching latest game:", error);
    return { success: false, error };
  }
};


export const getLatestGameId = async () => {
  try {
    const game = await prisma.games.findFirst({
      where: {
        game_date: {
          gte: new Date(),
        },
      },
      select: {
        id: true,
      },
    });

    // Check if a game was found
    if (!game) {
      return { success: false, message: "No games found" };
    }

    return { success: true, game };
  } catch (error: any) {
    console.error({ success: false, message: error.message });
    return { success: false, message: error.message };
  }
};



export const getGameById = async (gameId: number) => {
  try {
    const game = await prisma.games.findUnique({
      where: {
        id: gameId,
      },
    });
    if (!game) {
      return { success: false, message: "Game not found" };
    }
    return { success: true, game };
  } catch (error: any) {
    console.error(error.message);
    return { success: false, message: error.message };
  }
};
