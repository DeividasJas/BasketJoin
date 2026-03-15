'use server'

import { auth } from '@/auth'
import { prisma } from '@/utils/prisma'
import { revalidatePath } from 'next/cache'
import { LeagueStatus, GameStatus } from '@/generated/prisma/client/client'
import type { CreateLeagueResult } from '@/types/prismaTypes'
import { generateRecurringDates, validateScheduleConfig, parseCustomDates, type RecurringPattern } from '@/lib/scheduleUtils'
import { isDemoUser } from '@/lib/demo'

/**
 * Create a new league with optional schedule generation
 */
export async function createLeague(formData: {
  name: string
  description?: string
  locationId: number
  startDate: Date
  endDate: Date
  gymRentalCost: number // in cents
  guestFeePerGame: number // in cents
  paymentDueDates: string[] // Array of ISO date strings
  minPlayers?: number
  maxPlayers?: number
  gameType?: string
  gameDescription?: string
  scheduleType?: 'RECURRING' | 'CUSTOM'
  recurringPattern?: RecurringPattern
  customDates?: string[] // ISO date strings
}): Promise<CreateLeagueResult> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, message: 'Authentication required' }
    }

    // Check if user is admin
    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== 'ADMIN') {
      return { success: false, message: 'Admin access required' }
    }

    // Validate dates
    const start = new Date(formData.startDate)
    const end = new Date(formData.endDate)

    if (start >= end) {
      return {
        success: false,
        message: 'End date must be after start date',
      }
    }

    // Validate payment due dates
    if (!formData.paymentDueDates || formData.paymentDueDates.length === 0) {
      return {
        success: false,
        message: 'At least one payment due date is required',
      }
    }

    // Validate schedule configuration (only if schedule type is provided)
    if (formData.scheduleType) {
      const scheduleValidation = validateScheduleConfig(
        formData.scheduleType,
        formData.recurringPattern,
        formData.customDates?.map(d => new Date(d)),
      )

      if (!scheduleValidation.isValid) {
        return {
          success: false,
          message: scheduleValidation.error || 'Invalid schedule configuration',
        }
      }
    }

    // Validate location exists
    const location = await prisma.locations.findUnique({
      where: { id: formData.locationId },
    })

    if (!location) {
      return { success: false, message: 'Location not found' }
    }

    // Create the league
    const league = await prisma.league.create({
      data: {
        name: formData.name,
        description: formData.description,
        location_id: formData.locationId,
        start_date: start,
        end_date: end,
        gym_rental_cost: formData.gymRentalCost,
        guest_fee_per_game: formData.guestFeePerGame,
        payment_due_dates: JSON.stringify(formData.paymentDueDates),
        min_players: formData.minPlayers || 10,
        max_players: formData.maxPlayers,
        game_type: formData.gameType,
        game_description: formData.gameDescription,
        schedule_type: formData.scheduleType,
        recurring_pattern: formData.recurringPattern ? JSON.stringify(formData.recurringPattern) : null,
        custom_dates: formData.customDates ? JSON.stringify(formData.customDates) : null,
        status: LeagueStatus.UPCOMING,
        is_demo: await isDemoUser(),
      },
      include: {
        location: true,
        games: true,
        memberships: true,
        payments: true,
        payment_schedules: true,
      },
    })

    // Generate games based on schedule (only if schedule type is provided)
    if (formData.scheduleType) {
      await generateGamesForLeague(league.id)
    }

    // Fetch updated league with games
    const updatedLeague = await prisma.league.findUnique({
      where: { id: league.id },
      include: {
        location: true,
        games: true,
        memberships: true,
        payments: true,
        payment_schedules: true,
      },
    })

    revalidatePath('/dashboard/leagues')

    return {
      success: true,
      message: formData.scheduleType
        ? `League "${league.name}" created successfully with ${updatedLeague?.games.length || 0} games`
        : `League "${league.name}" created successfully`,
      league: updatedLeague!,
    }
  } catch (error) {
    console.error('Error creating league:', error)
    return {
      success: false,
      message: 'Failed to create league. Please try again.',
    }
  }
}

/**
 * Generate games for a league based on its schedule configuration
 */
export async function generateGamesForLeague(leagueId: string): Promise<void> {
  const league = await prisma.league.findUnique({
    where: { id: leagueId },
  })

  if (!league) {
    throw new Error('League not found')
  }

  let gameDates: Date[] = []

  if (league.schedule_type === 'RECURRING' && league.recurring_pattern) {
    const pattern: RecurringPattern = JSON.parse(league.recurring_pattern)
    gameDates = generateRecurringDates(league.start_date, league.end_date, pattern)
  } else if (league.schedule_type === 'CUSTOM' && league.custom_dates) {
    gameDates = parseCustomDates(league.custom_dates)
  }

  // Create games
  if (gameDates.length > 0) {
    const isDemo = await isDemoUser()

    await prisma.games.createMany({
      data: gameDates.map(date => ({
        game_date: date,
        location_id: league.location_id,
        league_id: league.id,
        min_players: league.min_players,
        max_players: league.max_players,
        game_type: league.game_type,
        description: league.game_description,
        status: GameStatus.SCHEDULED,
        is_demo: isDemo,
      })),
    })
  }
}

/**
 * Update an existing league
 * If schedule is updated, regenerate future games while preserving registrations
 */
export async function updateLeague(
  leagueId: string,
  formData: {
    name?: string
    description?: string
    locationId?: number
    startDate?: Date
    endDate?: Date
    gymRentalCost?: number
    guestFeePerGame?: number
    paymentDueDates?: string[]
    minPlayers?: number
    maxPlayers?: number
    gameType?: string
    gameDescription?: string
    scheduleType?: 'RECURRING' | 'CUSTOM'
    recurringPattern?: RecurringPattern
    customDates?: string[]
  },
): Promise<CreateLeagueResult> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, message: 'Authentication required' }
    }

    // Check if user is admin
    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== 'ADMIN') {
      return { success: false, message: 'Admin access required' }
    }

    // Get existing league
    const existingLeague = await prisma.league.findUnique({
      where: { id: leagueId },
    })

    if (!existingLeague) {
      return { success: false, message: 'League not found' }
    }

    // Don't allow editing completed or cancelled leagues
    if (existingLeague.status === LeagueStatus.COMPLETED || existingLeague.status === LeagueStatus.CANCELLED) {
      return {
        success: false,
        message: 'Cannot edit completed or cancelled leagues',
      }
    }

    // Validate dates if provided
    if (formData.startDate || formData.endDate) {
      const start = formData.startDate ? new Date(formData.startDate) : existingLeague.start_date
      const end = formData.endDate ? new Date(formData.endDate) : existingLeague.end_date

      if (start >= end) {
        return {
          success: false,
          message: 'End date must be after start date',
        }
      }
    }

    // Check if schedule is being updated
    const scheduleChanged =
      formData.scheduleType !== undefined ||
      formData.recurringPattern !== undefined ||
      formData.customDates !== undefined ||
      formData.startDate !== undefined ||
      formData.endDate !== undefined

    // Validate schedule if being updated
    if (scheduleChanged) {
      const scheduleType = formData.scheduleType || existingLeague.schedule_type
      const recurringPattern =
        formData.recurringPattern !== undefined
          ? formData.recurringPattern
          : existingLeague.recurring_pattern
            ? JSON.parse(existingLeague.recurring_pattern)
            : null
      const customDates =
        formData.customDates !== undefined
          ? formData.customDates.map(d => new Date(d))
          : existingLeague.custom_dates
            ? parseCustomDates(existingLeague.custom_dates)
            : null

      const scheduleValidation = validateScheduleConfig(scheduleType, recurringPattern, customDates)

      if (!scheduleValidation.isValid) {
        return {
          success: false,
          message: scheduleValidation.error || 'Invalid schedule configuration',
        }
      }
    }

    // Build update data
    const updateData: any = {}
    if (formData.name !== undefined) updateData.name = formData.name
    if (formData.description !== undefined) updateData.description = formData.description
    if (formData.locationId !== undefined) updateData.location_id = formData.locationId
    if (formData.startDate) updateData.start_date = new Date(formData.startDate)
    if (formData.endDate) updateData.end_date = new Date(formData.endDate)
    if (formData.gymRentalCost !== undefined) updateData.gym_rental_cost = formData.gymRentalCost
    if (formData.guestFeePerGame !== undefined) updateData.guest_fee_per_game = formData.guestFeePerGame
    if (formData.paymentDueDates) updateData.payment_due_dates = JSON.stringify(formData.paymentDueDates)
    if (formData.minPlayers !== undefined) updateData.min_players = formData.minPlayers
    if (formData.maxPlayers !== undefined) updateData.max_players = formData.maxPlayers
    if (formData.gameType !== undefined) updateData.game_type = formData.gameType
    if (formData.gameDescription !== undefined) updateData.game_description = formData.gameDescription
    if (formData.scheduleType !== undefined) updateData.schedule_type = formData.scheduleType
    if (formData.recurringPattern !== undefined) updateData.recurring_pattern = formData.recurringPattern ? JSON.stringify(formData.recurringPattern) : null
    if (formData.customDates !== undefined) updateData.custom_dates = formData.customDates ? JSON.stringify(formData.customDates) : null

    // Update the league
    const league = await prisma.league.update({
      where: { id: leagueId },
      data: updateData,
      include: {
        location: true,
        games: true,
        memberships: true,
        payments: true,
        payment_schedules: true,
      },
    })

    // If schedule changed, regenerate future games
    if (scheduleChanged) {
      await regenerateFutureGames(leagueId)
    }

    revalidatePath('/dashboard/leagues')
    revalidatePath(`/dashboard/leagues/${leagueId}`)

    return {
      success: true,
      message: 'League updated successfully',
      league,
    }
  } catch (error) {
    console.error('Error updating league:', error)
    return {
      success: false,
      message: 'Failed to update league. Please try again.',
    }
  }
}

/**
 * Regenerate future games for a league after schedule update
 * Preserves registrations by transferring them to new games by index
 */
export async function regenerateFutureGames(leagueId: string): Promise<void> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // 1. Get all future games with their registrations
  const futureGames = await prisma.games.findMany({
    where: {
      league_id: leagueId,
      game_date: { gte: today },
    },
    include: {
      game_registrations: {
        select: {
          user_id: true,
          registration_type: true,
          status: true,
          guest_fee_paid: true,
        },
      },
    },
    orderBy: { game_date: 'asc' },
  })

  // 2. Store registrations by game index
  const registrationsByIndex = futureGames.map((game, index) => ({
    gameIndex: index,
    registrations: game.game_registrations,
  }))

  // 3. Delete all future games
  await prisma.games.deleteMany({
    where: {
      league_id: leagueId,
      game_date: { gte: today },
    },
  })

  // 4. Generate new games from updated schedule
  await generateGamesForLeague(leagueId)

  // 5. Get newly created future games
  const newGames = await prisma.games.findMany({
    where: {
      league_id: leagueId,
      game_date: { gte: today },
    },
    orderBy: { game_date: 'asc' },
  })

  // 6. Transfer registrations to new games by index
  const isDemo = await isDemoUser()

  for (const { gameIndex, registrations } of registrationsByIndex) {
    if (newGames[gameIndex] && registrations.length > 0) {
      await prisma.game_registrations.createMany({
        data: registrations.map(reg => ({
          user_id: reg.user_id,
          game_id: newGames[gameIndex].id,
          registration_type: reg.registration_type,
          status: reg.status,
          guest_fee_paid: reg.guest_fee_paid,
          is_demo: isDemo,
        })),
        skipDuplicates: true,
      })
    }
  }
}

/**
 * Delete a league
 */
export async function deleteLeague(leagueId: string): Promise<{ success: boolean; message: string }> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, message: 'Authentication required' }
    }

    // Check if user is admin
    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== 'ADMIN') {
      return { success: false, message: 'Admin access required' }
    }

    const league = await prisma.league.findUnique({
      where: { id: leagueId },
    })

    if (!league) {
      return { success: false, message: 'League not found' }
    }

    await prisma.league.delete({
      where: { id: leagueId },
    })

    revalidatePath('/dashboard/leagues')

    return { success: true, message: 'League deleted successfully' }
  } catch (error) {
    console.error('Error deleting league:', error)
    return {
      success: false,
      message: 'Failed to delete league. Please try again.',
    }
  }
}

/**
 * Activate a league (set status to ACTIVE)
 */
export async function activateLeague(leagueId: string): Promise<{ success: boolean; message: string }> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, message: 'Authentication required' }
    }

    // Check if user is admin
    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== 'ADMIN') {
      return { success: false, message: 'Admin access required' }
    }

    const league = await prisma.league.findUnique({
      where: { id: leagueId },
    })

    if (!league) {
      return { success: false, message: 'League not found' }
    }

    if (league.status !== LeagueStatus.UPCOMING) {
      return {
        success: false,
        message: 'Only upcoming leagues can be activated',
      }
    }

    await prisma.league.update({
      where: { id: leagueId },
      data: { status: LeagueStatus.ACTIVE },
    })

    revalidatePath('/dashboard/leagues')
    revalidatePath(`/dashboard/leagues/${leagueId}`)

    return { success: true, message: 'League activated successfully' }
  } catch (error) {
    console.error('Error activating league:', error)
    return {
      success: false,
      message: 'Failed to activate league. Please try again.',
    }
  }
}

/**
 * Complete a league and process rebates
 */
export async function completeLeague(leagueId: string): Promise<{ success: boolean; message: string }> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, message: 'Authentication required' }
    }

    // Check if user is admin
    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== 'ADMIN') {
      return { success: false, message: 'Admin access required' }
    }

    const league = await prisma.league.findUnique({
      where: { id: leagueId },
      include: {
        memberships: {
          where: { status: 'ACTIVE' },
          include: { user: true },
        },
        payments: {
          where: { payment_type: 'GUEST_FEE' },
        },
      },
    })

    if (!league) {
      return { success: false, message: 'League not found' }
    }

    if (league.status !== LeagueStatus.ACTIVE) {
      return {
        success: false,
        message: 'Only active leagues can be completed',
      }
    }

    // Calculate total guest fees collected
    const totalGuestFees = league.payments.reduce((sum, payment) => sum + payment.amount, 0)

    // Calculate rebate per member
    const activeMembers = league.memberships.length
    const rebatePerMember = activeMembers > 0 ? Math.floor(totalGuestFees / activeMembers) : 0

    // Create rebate payment records for each member
    if (rebatePerMember > 0) {
      const isDemo = await isDemoUser()

      const rebatePayments = league.memberships.map(membership => ({
        user_id: membership.user_id,
        league_id: leagueId,
        membership_id: membership.id,
        payment_type: 'REBATE' as const,
        amount: rebatePerMember,
        payment_method: 'REBATE',
        notes: `League end rebate from guest fees. Total collected: €${totalGuestFees / 100}, Split among ${activeMembers} members`,
        is_demo: isDemo,
      }))

      await prisma.payment.createMany({
        data: rebatePayments,
      })
    }

    // Update league status
    await prisma.league.update({
      where: { id: leagueId },
      data: { status: LeagueStatus.COMPLETED },
    })

    revalidatePath('/dashboard/leagues')
    revalidatePath(`/dashboard/leagues/${leagueId}`)

    return {
      success: true,
      message: `League completed. ${activeMembers > 0 ? `Rebates of €${rebatePerMember / 100} distributed to ${activeMembers} members.` : 'No rebates to distribute.'}`,
    }
  } catch (error) {
    console.error('Error completing league:', error)
    return {
      success: false,
      message: 'Failed to complete league. Please try again.',
    }
  }
}

/**
 * Cancel a league
 */
export async function cancelLeague(leagueId: string, reason?: string): Promise<{ success: boolean; message: string }> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, message: 'Authentication required' }
    }

    // Check if user is admin
    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (user?.role !== 'ADMIN') {
      return { success: false, message: 'Admin access required' }
    }

    const league = await prisma.league.findUnique({
      where: { id: leagueId },
    })

    if (!league) {
      return { success: false, message: 'League not found' }
    }

    if (league.status === LeagueStatus.COMPLETED) {
      return {
        success: false,
        message: 'Cannot cancel completed leagues',
      }
    }

    await prisma.league.update({
      where: { id: leagueId },
      data: { status: LeagueStatus.CANCELLED },
    })

    revalidatePath('/dashboard/leagues')
    revalidatePath(`/dashboard/leagues/${leagueId}`)

    return {
      success: true,
      message: `League cancelled successfully${reason ? `: ${reason}` : ''}`,
    }
  } catch (error) {
    console.error('Error cancelling league:', error)
    return {
      success: false,
      message: 'Failed to cancel league. Please try again.',
    }
  }
}

/**
 * Get all leagues
 */
export async function getAllLeagues() {
  try {
    const isDemo = await isDemoUser()

    const leagues = await prisma.league.findMany({
      where: { is_demo: isDemo },
      include: {
        location: true,
        memberships: {
          include: {
            user: {
              select: {
                id: true,
                given_name: true,
                family_name: true,
                email: true,
              },
            },
          },
        },
        _count: {
          select: {
            games: true,
            memberships: true,
            payments: true,
            payment_schedules: true,
          },
        },
      },
      orderBy: { start_date: 'desc' },
    })

    return { success: true, leagues }
  } catch (error) {
    console.error('Error fetching leagues:', error)
    return { success: false, leagues: [], message: 'Failed to fetch leagues' }
  }
}

/**
 * Get league by ID with all related data
 */
export async function getLeagueById(leagueId: string) {
  try {
    const league = await prisma.league.findUnique({
      where: { id: leagueId },
      include: {
        location: true,
        games: {
          include: {
            game_registrations: {
              include: {
                user: {
                  select: {
                    id: true,
                    given_name: true,
                    family_name: true,
                    email: true,
                  },
                },
              },
            },
          },
          orderBy: { game_date: 'asc' },
        },
        memberships: {
          include: {
            user: {
              select: {
                id: true,
                given_name: true,
                family_name: true,
                email: true,
              },
            },
            payment_schedules: {
              orderBy: { due_date: 'asc' },
            },
          },
        },
        payments: {
          include: {
            user: {
              select: {
                id: true,
                given_name: true,
                family_name: true,
                email: true,
              },
            },
          },
          orderBy: { payment_date: 'desc' },
        },
        _count: {
          select: {
            games: true,
            memberships: true,
            payments: true,
            payment_schedules: true,
          },
        },
      },
    })

    if (!league) {
      return { success: false, message: 'League not found' }
    }

    return { success: true, league }
  } catch (error) {
    console.error('Error fetching league:', error)
    return { success: false, message: 'Failed to fetch league' }
  }
}

/**
 * Get active leagues
 */
export async function getActiveLeagues() {
  try {
    const isDemo = await isDemoUser()

    const leagues = await prisma.league.findMany({
      where: { status: LeagueStatus.ACTIVE, is_demo: isDemo },
      include: {
        location: true,
        _count: {
          select: {
            games: true,
            memberships: true,
          },
        },
      },
      orderBy: { start_date: 'desc' },
    })

    return { success: true, leagues }
  } catch (error) {
    console.error('Error fetching active leagues:', error)
    return {
      success: false,
      leagues: [],
      message: 'Failed to fetch active leagues',
    }
  }
}

/**
 * Get upcoming leagues
 */
export async function getUpcomingLeagues() {
  try {
    const isDemo = await isDemoUser()

    const leagues = await prisma.league.findMany({
      where: { status: LeagueStatus.UPCOMING, is_demo: isDemo },
      include: {
        location: true,
        _count: {
          select: {
            games: true,
            memberships: true,
          },
        },
      },
      orderBy: { start_date: 'asc' },
    })

    return { success: true, leagues }
  } catch (error) {
    console.error('Error fetching upcoming leagues:', error)
    return {
      success: false,
      leagues: [],
      message: 'Failed to fetch upcoming leagues',
    }
  }
}

/**
 * Get browsable leagues for public viewing (ACTIVE and UPCOMING only)
 */
export async function getBrowsableLeagues() {
  try {
    const isDemo = await isDemoUser()

    const leagues = await prisma.league.findMany({
      where: {
        status: {
          in: [LeagueStatus.ACTIVE, LeagueStatus.UPCOMING],
        },
        is_demo: isDemo,
      },
      include: {
        location: true,
        _count: {
          select: {
            games: true,
            memberships: true,
          },
        },
      },
      orderBy: [
        { status: 'asc' }, // ACTIVE first, then UPCOMING
        { start_date: 'asc' },
      ],
    })

    return { success: true, leagues }
  } catch (error) {
    console.error('Error fetching browsable leagues:', error)
    return {
      success: false,
      leagues: [],
      message: 'Failed to fetch leagues',
    }
  }
}
