"use server";
import { prisma } from "@/utils/prisma";
import { revalidatePath } from "next/cache";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

const { getUser } = getKindeServerSession();

const kindeUser = await getUser();

const startOfWeek = new Date();
startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
startOfWeek.setHours(0, 0, 0, 0);

const endOfWeek = new Date(startOfWeek);
endOfWeek.setDate(startOfWeek.getDate() + 6);
endOfWeek.setHours(23, 59, 59, 999);

export const getCurrentUser = async () => {
  try {
    const kindeUser = await getUser();
    if (!kindeUser) return { success: false, message: "Kinde user not found" };

    const currentUser = await prisma.users.findUnique({
      where: {
        id: kindeUser.id,
      },
    });
    if (!currentUser) return { success: false, message: "User not found" };

    return { success: true, currentUser };
  } catch (error: any) {
    console.error(error.message);
    return { success: false, message: error.message };
  }
};

export const updateUserForm: any = async (formData: FormData) => {
  try {
    const kindeUser = await getUser();
    const formDataObj = Object.fromEntries(formData);
    // console.log(formDataObj);

    const updatedUser = await prisma.users.update({
      where: {
        id: kindeUser.id,
      },
      data: {
        family_name: formDataObj.familyName as string,
        given_name: formDataObj.givenName as string,
        // email: formDataObj.email,
        // picture: formDataObj.picture,
        username: formDataObj.username as string,
        phone_number: formDataObj.phoneNumber as string,
      },
    });

    if (!updatedUser)
      return { success: false, message: "Could not update user" };
    revalidatePath("/profile");
    // console.log("revalidate");

    // if (updatedUser) return toast.success("User updated successfully");
    return { success: true, updatedUser, message: "User updated successfully" };
  } catch (error: any) {
    console.error(error.message);
    return { success: false, message: error.message };
  }
};

export const lastTenGamesFromUserRegistration = async () => {
  try {
    const kindeUser = await getUser();
    const { user, success } = await getUserById(kindeUser?.id);

    // console.log("user inside last ten games", user);

    if (!success) return { success: false, message: "User not found" };
    // console.log("end week", endOfWeek);
    // console.log("USER", user);

    const lastTenGames = await prisma.games.findMany({
      take: 10,
      where: {
        game_date: {
          gte: user?.created_at,
          lte: new Date(),
          // gte: "2024-01-22T21:59:59.999Z",
          // lte: "2025-02-22T21:59:59.999Z",
        },
      },
      include: {
        game_registrations: true,
      },
    });

    // console.log("LAST TEN GAMES", lastTenGames);

    if (!lastTenGames) return { success: false, message: "No games found" };
    return { success: true, lastTenGames, user };
  } catch (error: any) {
    console.error(error.message);
    return { success: false, message: error.message };
  }
};
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



// export const postNewGame = async (date: Date) => {
//   try {
//     const lithuanianDate = new Date(
//       date.toLocaleString("en-US", { timeZone: "Europe/Vilnius" }),
//     );

//     const latestGame = await prisma.games.findFirst({
//       orderBy: { game_date: "desc" },
//     });

//     if (!latestGame || latestGame.game_date < lithuanianDate) {
//       const newGame = await prisma.games.create({
//         data: { game_date: lithuanianDate },
//       });

//       return {
//         success: true,
//         message: "Game successfully created",
//         newGame,
//       };
//     }

//     return { success: false, message: "Game already exists" };
//   } catch (error: any) {
//     console.error(error.message);
//     return { success: false, message: error.message };
//   }
// };

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



// NEW ACTIONS ------------------------------------------------------------------------------------------------------------------------------
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

export const getAllGames = async () => {
  try {
    const allGames = await prisma.games.findMany({
      orderBy: {
        game_date: "asc",
      },
      include: { location: true },
    });

    if (!allGames) return { success: false, message: "No games found" };

    return { success: true, allGames };
  } catch (error: any) {
    console.error(error.message);
    return { success: false, message: error.message };
  }
};

export const getLatestGameId = async () => {
  "use server";
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
