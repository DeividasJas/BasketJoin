import { prisma } from '@/utils/prisma'
import { PaymentScheduleStatus } from '@prisma/client'

/**
 * Calculate pro-rated amount based on join date
 * Returns total amount and individual payment schedules
 */
export function calculateProRatedAmount(
  totalSeasonCost: number, // in cents
  seasonStart: Date,
  seasonEnd: Date,
  joinDate: Date,
  paymentDueDates: string[], // ISO date strings
): {
  totalAmount: number
  schedules: Array<{ dueDate: Date; amount: number }>
  percentageOfSeason: number
} {
  const start = new Date(seasonStart)
  const end = new Date(seasonEnd)
  const join = new Date(joinDate)

  // If joining before season starts, pay full amount
  if (join <= start) {
    const amountPerPayment = Math.floor(totalSeasonCost / paymentDueDates.length)
    const remainder = totalSeasonCost - amountPerPayment * paymentDueDates.length

    const schedules = paymentDueDates.map((dateStr, index) => ({
      dueDate: new Date(dateStr),
      amount: index === 0 ? amountPerPayment + remainder : amountPerPayment, // Add remainder to first payment
    }))

    return {
      totalAmount: totalSeasonCost,
      schedules,
      percentageOfSeason: 100,
    }
  }

  // If joining after season ends, return 0
  if (join >= end) {
    return {
      totalAmount: 0,
      schedules: [],
      percentageOfSeason: 0,
    }
  }

  // Calculate total season duration in milliseconds
  const totalDuration = end.getTime() - start.getTime()

  // Calculate remaining duration from join date
  const remainingDuration = end.getTime() - join.getTime()

  // Calculate percentage of season remaining
  const percentageRemaining = (remainingDuration / totalDuration) * 100

  // Calculate pro-rated total
  const proRatedTotal = Math.floor((totalSeasonCost * remainingDuration) / totalDuration)

  // Filter to only include due dates that are after join date
  const remainingDueDates = paymentDueDates
    .map(dateStr => new Date(dateStr))
    .filter(date => date >= join)
    .sort((a, b) => a.getTime() - b.getTime())

  if (remainingDueDates.length === 0) {
    // All due dates have passed, member owes full pro-rated amount immediately
    return {
      totalAmount: proRatedTotal,
      schedules: [
        {
          dueDate: new Date(join.getTime() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
          amount: proRatedTotal,
        },
      ],
      percentageOfSeason: percentageRemaining,
    }
  }

  // Split pro-rated amount across remaining payment dates
  const amountPerPayment = Math.floor(proRatedTotal / remainingDueDates.length)
  const remainder = proRatedTotal - amountPerPayment * remainingDueDates.length

  const schedules = remainingDueDates.map((date, index) => ({
    dueDate: date,
    amount: index === 0 ? amountPerPayment + remainder : amountPerPayment, // Add remainder to first payment
  }))

  return {
    totalAmount: proRatedTotal,
    schedules,
    percentageOfSeason: percentageRemaining,
  }
}

/**
 * Create payment schedule records in database
 */
export async function createPaymentSchedules(membershipId: string, leagueId: string, schedules: Array<{ dueDate: Date; amount: number }>) {
  const paymentSchedules = schedules.map(schedule => ({
    membership_id: membershipId,
    league_id: leagueId,
    due_date: schedule.dueDate,
    amount_due: schedule.amount,
    status: PaymentScheduleStatus.PENDING,
  }))

  return await prisma.paymentSchedule.createMany({
    data: paymentSchedules,
  })
}

/**
 * Check if payment schedule is overdue
 */
export function isPaymentOverdue(dueDate: Date, status: string): boolean {
  if (status === PaymentScheduleStatus.PAID) {
    return false
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)

  return due < today
}

/**
 * Update payment schedule status based on amount paid
 */
export function getPaymentScheduleStatus(amountDue: number, amountPaid: number, dueDate: Date): PaymentScheduleStatus {
  if (amountPaid >= amountDue) {
    return PaymentScheduleStatus.PAID
  }

  if (amountPaid > 0) {
    return PaymentScheduleStatus.PARTIALLY_PAID
  }

  if (isPaymentOverdue(dueDate, PaymentScheduleStatus.PENDING)) {
    return PaymentScheduleStatus.OVERDUE
  }

  return PaymentScheduleStatus.PENDING
}

/**
 * Format cents to currency string
 */
export function formatCurrency(cents: number, currency: string = 'EUR'): string {
  const amount = cents / 100
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

/**
 * Parse currency string to cents
 */
export function parseCurrencyToCents(value: string): number {
  // Remove currency symbols and whitespace
  const cleaned = value.replace(/[€$£,\s]/g, '')
  const num = parseFloat(cleaned)
  return Math.round(num * 100)
}

/**
 * Calculate days until due date
 */
export function daysUntilDue(dueDate: Date): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)

  const diffTime = due.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

/**
 * Get payment status badge color
 */
export function getPaymentStatusColor(status: PaymentScheduleStatus): string {
  switch (status) {
    case PaymentScheduleStatus.PAID:
      return 'bg-green-500'
    case PaymentScheduleStatus.PARTIALLY_PAID:
      return 'bg-yellow-500'
    case PaymentScheduleStatus.OVERDUE:
      return 'bg-red-500'
    case PaymentScheduleStatus.PENDING:
      return 'bg-blue-500'
    default:
      return 'bg-gray-500'
  }
}

/**
 * Calculate total amount owed by a member for a season
 */
export async function calculateMemberOwed(membershipId: string): Promise<{
  totalOwed: number
  totalPaid: number
  remainingBalance: number
}> {
  const paymentSchedules = await prisma.paymentSchedule.findMany({
    where: { membership_id: membershipId },
  })

  const totalOwed = paymentSchedules.reduce((sum, schedule) => sum + schedule.amount_due, 0)

  const totalPaid = paymentSchedules.reduce((sum, schedule) => sum + schedule.amount_paid, 0)

  return {
    totalOwed,
    totalPaid,
    remainingBalance: totalOwed - totalPaid,
  }
}

/**
 * Get upcoming payment schedules for a user
 */
export async function getUpcomingPayments(userId: string, daysAhead: number = 30) {
  const today = new Date()
  const futureDate = new Date(today)
  futureDate.setDate(futureDate.getDate() + daysAhead)

  const upcomingSchedules = await prisma.paymentSchedule.findMany({
    where: {
      membership: {
        user_id: userId,
        status: 'ACTIVE',
      },
      due_date: {
        gte: today,
        lte: futureDate,
      },
      status: {
        in: [PaymentScheduleStatus.PENDING, PaymentScheduleStatus.PARTIALLY_PAID],
      },
    },
    include: {
      league: true,
      membership: true,
    },
    orderBy: {
      due_date: 'asc',
    },
  })

  return upcomingSchedules
}

/**
 * Get overdue payments for a user
 */
export async function getOverduePayments(userId: string) {
  const today = new Date()

  const overdueSchedules = await prisma.paymentSchedule.findMany({
    where: {
      membership: {
        user_id: userId,
        status: 'ACTIVE',
      },
      due_date: {
        lt: today,
      },
      status: {
        in: [PaymentScheduleStatus.PENDING, PaymentScheduleStatus.PARTIALLY_PAID, PaymentScheduleStatus.OVERDUE],
      },
    },
    include: {
      league: true,
      membership: true,
    },
    orderBy: {
      due_date: 'asc',
    },
  })

  return overdueSchedules
}
