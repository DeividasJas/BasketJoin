'use server'

import { auth } from '@/auth'
import { prisma } from '@/utils/prisma'
import { revalidatePath } from 'next/cache'
import { PaymentType } from '@prisma/client'
import type { RecordPaymentResult } from '@/types/prismaTypes'
import { getPaymentScheduleStatus } from '@/lib/paymentUtils'

/**
 * Record a membership fee payment (admin marks payment as received)
 */
export async function recordMembershipPayment(formData: {
  paymentScheduleId: string
  amount: number // in cents
  paymentMethod?: string
  paymentDate?: Date
  notes?: string
}): Promise<RecordPaymentResult> {
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

    // Get payment schedule
    const schedule = await prisma.paymentSchedule.findUnique({
      where: { id: formData.paymentScheduleId },
      include: {
        membership: {
          include: {
            user: true,
          },
        },
        league: true,
      },
    })

    if (!schedule) {
      return { success: false, message: 'Payment schedule not found' }
    }

    // Validate amount
    if (formData.amount <= 0) {
      return { success: false, message: 'Payment amount must be greater than 0' }
    }

    const remainingBalance = schedule.amount_due - schedule.amount_paid
    if (formData.amount > remainingBalance) {
      return {
        success: false,
        message: `Payment amount (€${formData.amount / 100}) exceeds remaining balance (€${remainingBalance / 100})`,
      }
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        user_id: schedule.membership.user_id,
        league_id: schedule.league_id,
        membership_id: schedule.membership_id,
        payment_schedule_id: schedule.id,
        payment_type: PaymentType.MEMBERSHIP_FEE,
        amount: formData.amount,
        payment_method: formData.paymentMethod || 'BANK_TRANSFER',
        payment_date: formData.paymentDate || new Date(),
        notes: formData.notes,
      },
      include: {
        user: true,
        league: true,
        membership: true,
        payment_schedule: true,
      },
    })

    // Update payment schedule
    const newAmountPaid = schedule.amount_paid + formData.amount
    const newStatus = getPaymentScheduleStatus(schedule.amount_due, newAmountPaid, schedule.due_date)

    await prisma.paymentSchedule.update({
      where: { id: formData.paymentScheduleId },
      data: {
        amount_paid: newAmountPaid,
        status: newStatus,
        paid_at: newStatus === 'PAID' ? new Date() : schedule.paid_at,
      },
    })

    revalidatePath('/dashboard/payments')
    revalidatePath('/dashboard/memberships')
    revalidatePath(`/profile/memberships`)

    return {
      success: true,
      message: `Payment of €${formData.amount / 100} recorded successfully`,
      payment,
    }
  } catch (error) {
    console.error('Error recording payment:', error)
    return {
      success: false,
      message: 'Failed to record payment. Please try again.',
    }
  }
}

/**
 * Record a guest fee payment
 */
export async function recordGuestFee(formData: {
  gameId: number
  userId: string
  leagueId: string
  amount: number // in cents
  paymentMethod?: string
  paymentDate?: Date
  notes?: string
}): Promise<RecordPaymentResult> {
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

    // Verify game registration exists and is for a guest
    const registration = await prisma.game_registrations.findFirst({
      where: {
        user_id: formData.userId,
        game_id: formData.gameId,
      },
    })

    if (!registration) {
      return { success: false, message: 'Game registration not found' }
    }

    if (registration.registration_type !== 'GUEST') {
      return {
        success: false,
        message: 'This user is a member, not a guest',
      }
    }

    if (registration.guest_fee_paid) {
      return {
        success: false,
        message: 'Guest fee already paid for this game',
      }
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        user_id: formData.userId,
        league_id: formData.leagueId,
        payment_type: PaymentType.GUEST_FEE,
        amount: formData.amount,
        payment_method: formData.paymentMethod || 'CASH',
        payment_date: formData.paymentDate || new Date(),
        notes: formData.notes || `Guest fee for game #${formData.gameId}`,
      },
      include: {
        user: true,
        league: true,
        membership: true,
        payment_schedule: true,
      },
    })

    // Mark guest fee as paid in registration
    await prisma.game_registrations.update({
      where: { id: registration.id },
      data: { guest_fee_paid: true },
    })

    revalidatePath('/dashboard/payments')
    revalidatePath(`/dashboard/games/${formData.gameId}`)

    return {
      success: true,
      message: `Guest fee of €${formData.amount / 100} recorded successfully`,
      payment,
    }
  } catch (error) {
    console.error('Error recording guest fee:', error)
    return {
      success: false,
      message: 'Failed to record guest fee. Please try again.',
    }
  }
}

/**
 * Get all payments for a league
 */
export async function getLeaguePayments(leagueId: string) {
  try {
    const payments = await prisma.payment.findMany({
      where: { league_id: leagueId },
      include: {
        user: {
          select: {
            id: true,
            given_name: true,
            family_name: true,
            email: true,
          },
        },
        membership: true,
        payment_schedule: true,
      },
      orderBy: { payment_date: 'desc' },
    })

    return { success: true, payments }
  } catch (error) {
    console.error('Error fetching payments:', error)
    return {
      success: false,
      payments: [],
      message: 'Failed to fetch payments',
    }
  }
}

/**
 * Get all payments for a user
 */
export async function getUserPayments(userId?: string) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return {
        success: false,
        payments: [],
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
          payments: [],
          message: 'Admin access required',
        }
      }
    }

    const payments = await prisma.payment.findMany({
      where: { user_id: targetUserId },
      include: {
        league: true,
        membership: true,
        payment_schedule: true,
      },
      orderBy: { payment_date: 'desc' },
    })

    return { success: true, payments }
  } catch (error) {
    console.error('Error fetching user payments:', error)
    return {
      success: false,
      payments: [],
      message: 'Failed to fetch payments',
    }
  }
}

/**
 * Get payment schedule for a membership
 */
export async function getMembershipPaymentSchedule(membershipId: string) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return {
        success: false,
        schedules: [],
        message: 'Authentication required',
      }
    }

    const membership = await prisma.leagueMembership.findUnique({
      where: { id: membershipId },
      select: { user_id: true },
    })

    if (!membership) {
      return {
        success: false,
        schedules: [],
        message: 'Membership not found',
      }
    }

    // Verify user owns this membership or is admin
    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (membership.user_id !== session.user.id && user?.role !== 'ADMIN') {
      return {
        success: false,
        schedules: [],
        message: 'Unauthorized',
      }
    }

    const schedules = await prisma.paymentSchedule.findMany({
      where: { membership_id: membershipId },
      include: {
        payments: {
          orderBy: { payment_date: 'desc' },
        },
      },
      orderBy: { due_date: 'asc' },
    })

    return { success: true, schedules }
  } catch (error) {
    console.error('Error fetching payment schedule:', error)
    return {
      success: false,
      schedules: [],
      message: 'Failed to fetch payment schedule',
    }
  }
}

/**
 * Delete a payment record (admin only)
 */
export async function deletePayment(paymentId: string): Promise<{ success: boolean; message: string }> {
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

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { payment_schedule: true },
    })

    if (!payment) {
      return { success: false, message: 'Payment not found' }
    }

    // If this payment was linked to a schedule, update the schedule
    if (payment.payment_schedule_id) {
      const schedule = payment.payment_schedule
      if (schedule) {
        const newAmountPaid = schedule.amount_paid - payment.amount
        const newStatus = getPaymentScheduleStatus(schedule.amount_due, newAmountPaid, schedule.due_date)

        await prisma.paymentSchedule.update({
          where: { id: payment.payment_schedule_id },
          data: {
            amount_paid: newAmountPaid,
            status: newStatus,
            paid_at: newStatus === 'PAID' ? schedule.paid_at : null,
          },
        })
      }
    }

    // If this was a guest fee payment, update the registration
    if (payment.payment_type === PaymentType.GUEST_FEE) {
      const gameIdMatch = payment.notes?.match(/game #(\d+)/)
      if (gameIdMatch) {
        const gameId = parseInt(gameIdMatch[1])
        await prisma.game_registrations.updateMany({
          where: {
            user_id: payment.user_id,
            game_id: gameId,
          },
          data: { guest_fee_paid: false },
        })
      }
    }

    // Delete the payment
    await prisma.payment.delete({
      where: { id: paymentId },
    })

    revalidatePath('/dashboard/payments')
    revalidatePath('/dashboard/memberships')

    return { success: true, message: 'Payment deleted successfully' }
  } catch (error) {
    console.error('Error deleting payment:', error)
    return {
      success: false,
      message: 'Failed to delete payment. Please try again.',
    }
  }
}

/**
 * Get payment summary for a league
 */
export async function getLeaguePaymentSummary(leagueId: string) {
  try {
    const [membershipPayments, guestPayments, rebates] = await Promise.all([
      prisma.payment.aggregate({
        where: {
          league_id: leagueId,
          payment_type: PaymentType.MEMBERSHIP_FEE,
        },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.payment.aggregate({
        where: {
          league_id: leagueId,
          payment_type: PaymentType.GUEST_FEE,
        },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.payment.aggregate({
        where: {
          league_id: leagueId,
          payment_type: PaymentType.REBATE,
        },
        _sum: { amount: true },
        _count: true,
      }),
    ])

    const league = await prisma.league.findUnique({
      where: { id: leagueId },
      include: {
        _count: {
          select: { memberships: true },
        },
      },
    })

    return {
      success: true,
      summary: {
        membershipFeesCollected: membershipPayments._sum.amount || 0,
        membershipFeesCount: membershipPayments._count,
        guestFeesCollected: guestPayments._sum.amount || 0,
        guestFeesCount: guestPayments._count,
        rebatesDistributed: rebates._sum.amount || 0,
        rebatesCount: rebates._count,
        totalCollected: (membershipPayments._sum.amount || 0) + (guestPayments._sum.amount || 0),
        gymRentalCost: league?.gym_rental_cost || 0,
        memberCount: league?._count.memberships || 0,
      },
    }
  } catch (error) {
    console.error('Error fetching payment summary:', error)
    return {
      success: false,
      message: 'Failed to fetch payment summary',
    }
  }
}
