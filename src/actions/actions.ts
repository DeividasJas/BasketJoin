'use server'
import { prisma } from '@/utils/prisma'
import { auth } from '@/auth'
import { demoFilter } from '@/lib/demo'

export const getAllUserGames = async () => {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, message: 'Not authenticated' }
    }

    const isDemo = await demoFilter()

    const userPlayedGames = await prisma.game_registrations.findMany({
      where: {
        user_id: session.user.id,
        is_demo: isDemo,
      },
      include: { game: true },
    })

    if (!userPlayedGames) return { success: false, message: 'No games found' }

    return { success: true, userPlayedGames }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export const getUserById = async (userId: string) => {
  const user = await prisma.users.findUnique({
    where: { id: userId },
  })
  return { success: true, user }
}

export const getLatestGame = async () => {
  try {
    const isDemo = await demoFilter()

    const latestGame = await prisma.games.findFirst({
      where: {
        game_date: {
          gte: new Date(),
          // lte: "2025-01-22T21:59:59.999Z", // change this to endOfWeek
        },
        is_demo: isDemo,
      },
      select: {
        id: true,
        game_date: true,
        game_registrations: true,
      },
      orderBy: {
        game_date: 'asc',
      },
    })

    if (!latestGame || !latestGame.id) return { success: false }
    return { success: true, latestGame }
  } catch (error) {
    return { success: false }
  }
}

export const getLatestGameId = async () => {
  try {
    const isDemo = await demoFilter()

    const game = await prisma.games.findFirst({
      where: {
        game_date: {
          gte: new Date(),
        },
        is_demo: isDemo,
      },
      select: {
        id: true,
      },
    })

    // Check if a game was found
    if (!game) {
      return { success: false, message: 'No games found' }
    }

    return { success: true, game }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}

export const getGameById = async (gameId: number) => {
  try {
    const game = await prisma.games.findUnique({
      where: {
        id: gameId,
      },
    })
    if (!game) {
      return { success: false, message: 'Game not found' }
    }
    return { success: true, game }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}
