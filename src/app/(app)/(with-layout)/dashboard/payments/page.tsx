import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/utils/prisma'
import { formatCurrency } from '@/lib/paymentUtils'
import { Calendar } from 'lucide-react'
import PaymentSchedulesTable from '@/components/admin/PaymentSchedulesTable'

export default async function PaymentsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const session = await auth()
  const params = await searchParams

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const user = await prisma.users.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  if (user?.role !== 'ADMIN') {
    redirect('/schedule')
  }

  const statusFilter = params.status as 'PENDING' | 'PAID' | 'OVERDUE' | 'PARTIALLY_PAID' | undefined

  // Get all active/upcoming leagues
  const activeLeagues = await prisma.league.findMany({
    where: {
      status: { in: ['ACTIVE', 'UPCOMING'] },
    },
    select: {
      id: true,
      name: true,
    },
  })

  // Get payment schedules with filters
  const paymentSchedules = await prisma.paymentSchedule.findMany({
    where: statusFilter
      ? {
          status: statusFilter,
          league: {
            status: { in: ['ACTIVE', 'UPCOMING'] },
          },
        }
      : {
          league: {
            status: { in: ['ACTIVE', 'UPCOMING'] },
          },
        },
    include: {
      league: true,
      membership: {
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
      payments: {
        orderBy: { payment_date: 'desc' },
      },
    },
    orderBy: { due_date: 'asc' },
  })

  // Calculate summary stats
  const totalDue = paymentSchedules.reduce((sum, s) => sum + s.amount_due, 0)
  const totalPaid = paymentSchedules.reduce((sum, s) => sum + s.amount_paid, 0)
  const totalPending = totalDue - totalPaid

  const paidCount = paymentSchedules.filter(s => s.status === 'PAID').length
  const pendingCount = paymentSchedules.filter(s => s.status === 'PENDING').length
  const overdueCount = paymentSchedules.filter(s => s.status === 'OVERDUE').length

  // Upcoming payments (next 30 days)
  const today = new Date()
  const thirtyDaysFromNow = new Date(today)
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

  const upcomingPayments = paymentSchedules.filter(s => {
    const dueDate = new Date(s.due_date)
    return dueDate >= today && dueDate <= thirtyDaysFromNow && (s.status === 'PENDING' || s.status === 'PARTIALLY_PAID')
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Payments</h1>
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">Track membership payments and schedules</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700/60 dark:bg-zinc-900">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">Expected</p>
          <p className="mt-1 text-2xl font-extralight tabular-nums text-zinc-800 dark:text-zinc-100">{formatCurrency(totalDue)}</p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700/60 dark:bg-zinc-900">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">Collected</p>
          <p className="mt-1 text-2xl font-extralight tabular-nums text-zinc-800 dark:text-zinc-100">{formatCurrency(totalPaid)}</p>
          <p className="mt-1 text-[10px] tabular-nums text-zinc-400 dark:text-zinc-500">{totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0}%</p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700/60 dark:bg-zinc-900">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">Remaining</p>
          <p className="mt-1 text-2xl font-extralight tabular-nums text-zinc-800 dark:text-zinc-100">{formatCurrency(totalPending)}</p>
          <p className="mt-1 text-[10px] tabular-nums text-zinc-400 dark:text-zinc-500">{pendingCount} pending</p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700/60 dark:bg-zinc-900">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">Overdue</p>
          <p className="mt-1 text-2xl font-extralight tabular-nums text-red-500">{overdueCount}</p>
        </div>
      </div>

      {/* Upcoming Payments Notice */}
      {upcomingPayments.length > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-basket-400/20 bg-basket-400/5 p-4 dark:border-basket-400/10 dark:bg-basket-400/5">
          <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-basket-400" />
          <div>
            <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
              {upcomingPayments.length} payment
              {upcomingPayments.length !== 1 ? 's' : ''} due in 30 days
            </p>
            <p className="mt-0.5 text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
              {formatCurrency(upcomingPayments.reduce((sum, p) => sum + (p.amount_due - p.amount_paid), 0))} total
            </p>
          </div>
        </div>
      )}

      {/* Payment Table */}
      <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700/60 dark:bg-zinc-900">
        <PaymentSchedulesTable schedules={paymentSchedules} currentStatus={statusFilter} />
      </section>
    </div>
  )
}
