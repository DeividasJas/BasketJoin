'use server'

import { auth } from '@/auth'
import { prisma } from '@/utils/prisma'
import { revalidatePath } from 'next/cache'
import { MembershipStatus, PaymentScheduleStatus, LeagueStatus } from '@/generated/prisma/client/client'
import type { CreateMembershipResult } from '@/types/prismaTypes'
import { calculateProRatedAmount, createPaymentSchedules } from '@/lib/paymentUtils'
import { isDemoUser } from '@/lib/demo'

/**
 * Join a league (create membership)
 */
export async function joinLeague(leagueId: string, userId?: string): Promise<CreateMembershipResult> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, message: 'Authentication required' }
    }

    const memberId = userId || session.user.id

    // If admin is adding someone else, verify admin role
    if (userId && userId !== session.user.id) {
      const adminUser = await prisma.users.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      })

      if (adminUser?.role !== 'ADMIN') {
        return { success: false, message: 'Admin access required' }
      }
    }

    // Get league
    const league = await prisma.league.findUnique({
      where: { id: leagueId },
    })

    if (!league) {
      return {
        success: false,
        message: 'League not found',
      }
    }

    // Only allow joining active or upcoming leagues
    if (league.status !== LeagueStatus.ACTIVE && league.status !== LeagueStatus.UPCOMING) {
      return {
        success: false,
        message: 'League is not available for joining',
      }
    }

    // Check if user is already a member
    const existingMembership = await prisma.leagueMembership.findUnique({
      where: {
        user_id_league_id: {
          user_id: memberId,
          league_id: leagueId,
        },
      },
    })

    if (existingMembership) {
      return {
        success: false,
        message: 'You are already a member of this league',
      }
    }

    // Parse payment due dates
    const paymentDueDates: string[] = JSON.parse(league.payment_due_dates)

    // Calculate pro-rated amount
    const joinDate = new Date()
    const proRatedAmount = calculateProRatedAmount(league.gym_rental_cost, league.start_date, league.end_date, joinDate, paymentDueDates)

    // Create membership
    const isDemo = await isDemoUser()

    const membership = await prisma.leagueMembership.create({
      data: {
        user_id: memberId,
        league_id: leagueId,
        status: MembershipStatus.ACTIVE,
        pro_rated_amount: proRatedAmount.totalAmount,
        is_demo: isDemo,
      },
      include: {
        user: true,
        league: true,
        payment_schedules: true,
        payments: true,
      },
    })

    // Create payment schedules for remaining due dates
    await createPaymentSchedules(membership.id, leagueId, proRatedAmount.schedules)

    // Auto-register member for all future games in this league
    const futureGames = await prisma.games.findMany({
      where: {
        league_id: leagueId,
        game_date: { gte: new Date() },
        status: 'SCHEDULED',
      },
    })

    if (futureGames.length > 0) {
      await prisma.game_registrations.createMany({
        data: futureGames.map(game => ({
          user_id: memberId,
          game_id: game.id,
          status: 'CONFIRMED',
          registration_type: 'MEMBER',
          is_demo: isDemo,
        })),
        skipDuplicates: true,
      })
    }

    revalidatePath('/dashboard/memberships')
    revalidatePath(`/leagues/${leagueId}`)
    revalidatePath('/profile/memberships')

    return {
      success: true,
      message: `Successfully joined league! Your pro-rated fee is €${proRatedAmount.totalAmount / 100}`,
      membership,
    }
  } catch (error) {
    console.error('Error joining league:', error)
    return {
      success: false,
      message: 'Failed to join league. Please try again.',
    }
  }
}

/**
 * Cancel a membership
 */
export async function cancelMembership(membershipId: string, reason?: string): Promise<{ success: boolean; message: string }> {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return { success: false, message: 'Authentication required' }
    }

    const membership = await prisma.leagueMembership.findUnique({
      where: { id: membershipId },
      include: {
        league: true,
        payment_schedules: true,
      },
    })

    if (!membership) {
      return { success: false, message: 'Membership not found' }
    }

    // Only allow user to cancel their own membership, or admin
    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (membership.user_id !== session.user.id && user?.role !== 'ADMIN') {
      return { success: false, message: 'Unauthorized' }
    }

    // Don't allow cancelling if league is completed
    if (membership.league.status === LeagueStatus.COMPLETED) {
      return {
        success: false,
        message: 'Cannot cancel membership for completed leagues',
      }
    }

    // Check if there are any paid payment schedules
    const paidSchedules = membership.payment_schedules.filter(schedule => schedule.status === PaymentScheduleStatus.PAID)

    if (paidSchedules.length > 0) {
      return {
        success: false,
        message: 'Cannot cancel membership with paid installments. Please contact admin for refund.',
      }
    }

    // Update membership status
    await prisma.leagueMembership.update({
      where: { id: membershipId },
      data: { status: MembershipStatus.CANCELLED },
    })

    // Update game registrations to GUEST type
    await prisma.game_registrations.updateMany({
      where: {
        user_id: membership.user_id,
        game: {
          league_id: membership.league_id,
          game_date: { gte: new Date() },
        },
        registration_type: 'MEMBER',
      },
      data: {
        registration_type: 'GUEST',
        guest_fee_paid: false,
      },
    })

    revalidatePath('/dashboard/memberships')
    revalidatePath(`/leagues/${membership.league_id}`)
    revalidatePath('/profile/memberships')

    return {
      success: true,
      message: `Membership cancelled successfully${reason ? `: ${reason}` : ''}`,
    }
  } catch (error) {
    console.error('Error cancelling membership:', error)
    return {
      success: false,
      message: 'Failed to cancel membership. Please try again.',
    }
  }
}

/**
 * Reactivate a cancelled membership
 */
export async function reactivateMembership(membershipId: string): Promise<{ success: boolean; message: string }> {
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

    const membership = await prisma.leagueMembership.findUnique({
      where: { id: membershipId },
      include: { league: true },
    })

    if (!membership) {
      return { success: false, message: 'Membership not found' }
    }

    if (membership.status !== MembershipStatus.CANCELLED) {
      return {
        success: false,
        message: 'Only cancelled memberships can be reactivated',
      }
    }

    if (membership.league.status === LeagueStatus.COMPLETED) {
      return {
        success: false,
        message: 'Cannot reactivate membership for completed leagues',
      }
    }

    await prisma.leagueMembership.update({
      where: { id: membershipId },
      data: { status: MembershipStatus.ACTIVE },
    })

    // Restore game registrations to MEMBER type
    await prisma.game_registrations.updateMany({
      where: {
        user_id: membership.user_id,
        game: {
          league_id: membership.league_id,
          game_date: { gte: new Date() },
        },
      },
      data: {
        registration_type: 'MEMBER',
        guest_fee_paid: false,
      },
    })

    revalidatePath('/dashboard/memberships')
    revalidatePath(`/leagues/${membership.league_id}`)

    return {
      success: true,
      message: 'Membership reactivated successfully',
    }
  } catch (error) {
    console.error('Error reactivating membership:', error)
    return {
      success: false,
      message: 'Failed to reactivate membership. Please try again.',
    }
  }
}

/**
 * Get all memberships for a user
 */
export async function getUserMemberships(userId?: string) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return {
        success: false,
        memberships: [],
        message: 'Authentication required',
      }
    }

    const targetUserId = userId || session.user.id

    // If fetching for another user, verify admin role
    if (userId && userId !== session.user.id) {
      const user = await prisma.users.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      })

      if (user?.role !== 'ADMIN') {
        return {
          success: false,
          memberships: [],
          message: 'Admin access required',
        }
      }
    }

    const isDemo = await isDemoUser()

    const memberships = await prisma.leagueMembership.findMany({
      where: { user_id: targetUserId, is_demo: isDemo },
      include: {
        league: true,
        payment_schedules: {
          orderBy: { due_date: 'asc' },
        },
        payments: {
          orderBy: { payment_date: 'desc' },
        },
      },
      orderBy: { joined_at: 'desc' },
    })

    return { success: true, memberships }
  } catch (error) {
    console.error('Error fetching memberships:', error)
    return {
      success: false,
      memberships: [],
      message: 'Failed to fetch memberships',
    }
  }
}

/**
 * Get all memberships for a league
 */
export async function getLeagueMemberships(leagueId: string) {
  try {
    const isDemo = await isDemoUser()

    const memberships = await prisma.leagueMembership.findMany({
      where: { league_id: leagueId, is_demo: isDemo },
      include: {
        user: {
          select: {
            id: true,
            given_name: true,
            family_name: true,
            email: true,
          },
        },
        league: true,
        payment_schedules: {
          orderBy: { due_date: 'asc' },
        },
        _count: {
          select: {
            payments: true,
            payment_schedules: true,
          },
        },
      },
      orderBy: { joined_at: 'asc' },
    })

    return { success: true, memberships }
  } catch (error) {
    console.error('Error fetching league memberships:', error)
    return {
      success: false,
      memberships: [],
      message: 'Failed to fetch memberships',
    }
  }
}

/**
 * Check if user is member of a league
 */
export async function checkLeagueMembership(userId: string, leagueId: string): Promise<{ isMember: boolean; membership?: any }> {
  try {
    const league = await prisma.league.findUnique({
      where: { id: leagueId },
    })

    if (!league) {
      return { isMember: false }
    }

    const membership = await prisma.leagueMembership.findUnique({
      where: {
        user_id_league_id: {
          user_id: userId,
          league_id: leagueId,
        },
      },
      include: {
        league: true,
        payment_schedules: true,
      },
    })

    return {
      isMember: membership?.status === MembershipStatus.ACTIVE,
      membership,
    }
  } catch (error) {
    console.error('Error checking membership:', error)
    return { isMember: false }
  }
}
