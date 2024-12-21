"use server";
import { prisma } from "@/utils/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { revalidatePath } from "next/cache";

const { getUser } = getKindeServerSession();

const kindeUser = await getUser();
export const getCurrentUser = async () => {
  
  try {
    const kindeUser = await getUser();
    if (!kindeUser) return { success: false, message: "Kinde user not found" };

    const currentUser = await prisma.user.findUnique({
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
    console.log(formDataObj);

    const updatedUser = await prisma.user.update({
      where: {
        id: kindeUser.id,
      },
      data: {
        familyName: formDataObj.familyName as string,
        givenName: formDataObj.givenName as string,
        // email: formDataObj.email,
        // picture: formDataObj.picture,
        username: formDataObj.username as string,
        phoneNumber: formDataObj.phoneNumber as string,
      },
    });

    if (!updatedUser)
      return { success: false, message: "Could not update user" };
    revalidatePath("/profile");
    console.log("revalidate");

    // if (updatedUser) return toast.success("User updated successfully");
    return { success: true, updatedUser, message: "User updated successfully" };
  } catch (error: any) {
    console.error(error.message);
    return { success: false, message: error.message };
  }
};

// export const allUsers = async () => {
//   try {
//     const users = await prisma.user.findMany();
//     if (!users) return { success: false, message: "No users found" };
//     return { success: true, users };
//   } catch (error :any) {
//     console.error(error.message);
//     return { success: false, message: error.message };
//   }
// };

export const getLastTenGames = async () => {
  try {
    const lastTenGames = await prisma.game.findMany({
      take: 10,
      orderBy: {
        createdAt: "asc",
      },
      // include: {
      //   gameRegistrations: true,
      // },
    });
    if (!lastTenGames) return { success: false, message: "No games found" };
    return { success: true, lastTenGames };
  } catch (error: any) {
    console.error(error.message);
    return { success: false, message: error.message };
  }
};
export const getAllUserGames = async () => {
  try {
    const userPlayedGames = await prisma.gameRegistration.findMany({
      where: {
        userId: kindeUser?.id,
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

export const registerToGame = async () => {
  try {
    const kindeUser = await getUser();
    const latestGame = await prisma.game.findFirst({
      orderBy: {
        gameDate: "desc",
      },
    });

    if (!latestGame) return { success: false, message: "No games found" };

    const existingRegistration = await prisma.gameRegistration.findFirst({
      where: {
        userId: kindeUser?.id,
        gameId: latestGame?.id,
      },
    });

    if (existingRegistration)
      return {
        success: true,
        message: "You are already registered for this game",
      };

    const newRegistration = await prisma.gameRegistration.create({
      data: {
        userId: kindeUser?.id,
        familyName: kindeUser?.family_name,
        givenName: kindeUser?.given_name,
        gameId: latestGame?.id,
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

export const postNewGame = async (date: Date) => {
  try {
    const lithuanianDate = new Date(
      date.toLocaleString("en-US", { timeZone: "Europe/Vilnius" }),
    );

    const latestGame = await prisma.game.findFirst({
      orderBy: { gameDate: "desc" },
    });

    if (!latestGame || latestGame.gameDate < lithuanianDate) {
      const newGame = await prisma.game.create({
        data: { gameDate: lithuanianDate },
      });

      return {
        success: true,
        message: "Game successfully created",
        newGame,
      };
    }

    return { success: false, message: "Game already exists" };
  } catch (error: any) {
    console.error(error.message);
    return { success: false, message: error.message };
  }
};

export const addNewUser = async () => {
  try {
    const kindeUser = await getUser();

    if (!kindeUser) return { success: false, message: "User not found" };

    //   //   Check or create user with memoization
    const existingUser = await prisma.user.findUnique({
      where: {
        id: kindeUser.id,
      },
    });

    if (existingUser) return { success: true, message: "User already exists" };

    console.log("EXISTING USER", existingUser);

    const user = await prisma.user.upsert({
      where: {
        id: kindeUser.id,
      },
      update: {
        email: kindeUser.email || "",
        familyName: kindeUser.family_name || "",
        givenName: kindeUser.given_name || "",
        picture: kindeUser.picture,
        username: kindeUser.username,
        phoneNumber: kindeUser.phone_number,
      },
      create: {
        id: kindeUser.id,
        email: kindeUser.email || "",
        familyName: kindeUser.family_name || "",
        givenName: kindeUser.given_name || "",
        picture: kindeUser.picture,
        username: kindeUser.username,
        phoneNumber: kindeUser.phone_number,
      },
    });

    return { success: true, user, message: "User created successfully" };
  } catch (error: any) {
    console.error(error);
    return { success: false, message: error.message };
  }
};

export const getUserById = async (userId: string) => {
  // console.log("USERID", userId);

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  return { success: true, user };
};

export const cancelRegistration = async ({
  userId,
  gameId,
}: {
  userId: string;
  gameId: number;
}) => {
  try {
    const registration = await prisma.gameRegistration.delete({
      where: {
        userId_gameId: {
          userId: userId,
          gameId: gameId,
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

export const latestGameAndPlayers = async () => {
  try {
    // Find the latest game with full details
    const latestGame = await prisma.game.findFirst({
      orderBy: {
        id: "desc", // Changed to 'desc' to get the most recent game
      },
      include: {
        // Include related game registrations with user details
        gameRegistrations: {
          include: {
            user: {
              select: {
                id: true,
                givenName: true,
                familyName: true,
                email: true,
                username: true,
                phoneNumber: true,
                picture: true,
                createdAt: true,
                // Add any other user fields you want to include
              },
            },
          },
          // Optional: Add ordering for registrations if needed
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    // If no game found, return appropriate response
    if (!latestGame) {
      return {
        success: false,
        message: "No games found",
        latestGame: null,
        participants: [],
      };
    }

    const user = await getUser();
    // console.log('ACTION KINDE USER', user);

    // Transform the result to a more explicit structure
    return {
      success: true,
      latestGame: {
        id: latestGame.id,
        gameDate: latestGame.gameDate,
        // Add any other game details you want to include
      },
      participants: latestGame.gameRegistrations.map(
        (registration) => registration.user,
        // registrationDetails: {
        //   registeredAt: registration.createdAt,
        //   // Include any additional registration-specific details
        // },d
      ),
      isActive: latestGame.gameRegistrations.some(
        (registration) => registration.user.id === user?.id,
      ),
    };
  } catch (error: any) {
    console.error("Error fetching latest game:", error);
    return {
      success: false,
      message: "Error fetching game details",
      latestGame: null,
      participants: [],
    };
  }
};

export const getLatestGame = async () => {
  const latestGame = await prisma.game.findFirst({
    select: {
      id: true,
      gameDate: true,
      gameRegistrations: true,
    },
    orderBy: {
      gameDate: "desc",
    },
  });
  if (!latestGame || !latestGame.id) return { success: false };
  return { success: true, latestGame };
};
