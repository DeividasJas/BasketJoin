'use server';
import { prisma } from '@/utils/prisma';
import { KindeUser } from '../types/user';
// import { revalidatePath } from 'next/cache';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';


const { getUser } = getKindeServerSession();

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
      return { success: false, message: 'Registration not found' };
    }
  }
};

export const latestGameAndPlayers = async () => {
  try {
    // Find the latest game with full details
    const latestGame = await prisma.game.findFirst({
      orderBy: {
        id: 'desc', // Changed to 'desc' to get the most recent game
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
            createdAt: 'asc',
          },
        },
      },
    });

    // If no game found, return appropriate response
    if (!latestGame) {
      return {
        success: false,
        message: 'No games found',
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
        (registration) => registration.user
        // registrationDetails: {
        //   registeredAt: registration.createdAt,
        //   // Include any additional registration-specific details
        // },d
      ),
      isActive: latestGame.gameRegistrations.some(
        (registration) => registration.user.id === user?.id
      ),
    };
  } catch (error) {
    console.error('Error fetching latest game:', error);
    return {
      success: false,
      message: 'Error fetching game details',
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
      gameDate: 'desc',
    },
  });
  if (!latestGame || !latestGame.id) return false;
  return latestGame;
};

// 9999999999999999999999999999999
export const testAction = async () => {
  console.log('hello');

  const test = await prisma.game.findMany();
  console.log('ddddd', test);

  return test;
};

export const getUsers = async () => {
  const users = await prisma.user.findMany();
  return users;
};

export const registerUser = async (user: KindeUser) => {
  console.log(user);

  const newUser = await prisma.user.create({
    data: {
      id: user.id,
      email: user.email,
      familyName: user.family_name,
      givenName: user.given_name,
      picture: user.picture,
      // username: user.username,
      phoneNumber: user.phone_number,
    },
  });
  // console.log(newUser);
  return newUser;
};

export const registerUserToGame = async (user: KindeUser, gameId: number) => {
  const newUser = await prisma.gameRegistration.create({
    data: {
      userId: user.id,
      gameId: gameId,
      givenName: user.given_name,
      familyName: user.family_name,
      email: user.email,
    },
  });
  console.log(newUser);
  return newUser;
};

// export const getNextGame = async () => {
//   // const nextGame = await prisma.game.findFirst({
//   //   orderBy: {
//   //     gameDate: 'asc',
//   //   },
//   // });
//   // console.log(nextGame);
//   const nextGame = await prisma.game.findFirst()
//   console.log('what up');

//   // return 'hehehe'
//   return nextGame;
// };

// export async function getNextGame() {
//   try {
//     const nextGame = await prisma.game.findFirst(); // Perform your query here
//     console.log('Next game:', nextGame);
//     return nextGame;
//   } catch (error) {
//     console.error('Error fetching next game:', error);
//     throw new Error('Failed to fetch next game.');
//   }
// }

// export const registerToGame = async (user: KindeUser, gameId: number) => {
//   const response = await  fetch('/api/registration', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ user, gameId }),
//   })

//   const data = response.json()
//   console.log('IN ACCCCCTIONS',data);
//   return response;
// };
export const registerToGame = async (user: KindeUser, gameId: number) => {
  try {
    const url = process.env.SITE_URL
    console.log('server url', url);
    
    // Validate inputs before sending
    if (!user?.id || !gameId) {
      throw new Error('Missing required fields');
    }

    const response = await fetch(`${url}/api/registration`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user: {
          id: user.id,
          // Only send necessary user data
          email: user.email,
        },
        gameId: gameId,
      }),
      // Ensure fetch doesn't cache the response
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }

    const data = await response.json();
    console.log('Registration successful:', data);
    return data;
  } catch (error) {
    console.error('Registration action error:', error);
    throw error; // Re-throw to handle in the component
  }
};
