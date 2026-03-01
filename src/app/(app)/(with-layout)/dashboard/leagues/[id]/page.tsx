import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/utils/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, CheckCircle, Clock, Edit } from 'lucide-react'
import { formatCurrency } from '@/lib/paymentUtils'
import LeagueActions from '@/components/admin/LeagueActions'
import MembershipsList from '@/components/admin/MembershipsList'

export default async function LeagueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()

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

  const league = await prisma.league.findUnique({
    where: { id },
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
          payment_schedules: {
            orderBy: { due_date: 'asc' },
          },
          _count: {
            select: {
              payments: true,
            },
          },
        },
        orderBy: { joined_at: 'asc' },
      },
      payments: {
        include: {
          user: {
            select: {
              id: true,
              given_name: true,
              family_name: true,
            },
          },
        },
        orderBy: { payment_date: 'desc' },
      },
      _count: {
        select: {
          memberships: true,
          payments: true,
          payment_schedules: true,
        },
      },
    },
  })

  if (!league) {
    redirect('/dashboard/leagues')
  }

  const paymentDueDates: string[] = JSON.parse(league.payment_due_dates)

  const statusStyle: Record<string, string> = {
    UPCOMING: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    ACTIVE: 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400',
    COMPLETED: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
    CANCELLED: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
  }

  // Calculate financial summary
  const totalMembershipFees = league.payments.filter(p => p.payment_type === 'MEMBERSHIP_FEE').reduce((sum, p) => sum + p.amount, 0)

  const totalGuestFees = league.payments.filter(p => p.payment_type === 'GUEST_FEE').reduce((sum, p) => sum + p.amount, 0)

  const totalCollected = totalMembershipFees + totalGuestFees
  const expectedFromMembers = league.memberships.reduce((sum, m) => sum + m.pro_rated_amount, 0)

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/dashboard/leagues"
        className="inline-flex items-center gap-1 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
      >
        <ArrowLeft className="h-3 w-3" />
        Leagues
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">{league.name}</h1>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusStyle[league.status] || 'bg-zinc-100 text-zinc-500'}`}
            >
              {league.status}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{league.location.name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild className="h-8 border-zinc-200 text-xs dark:border-zinc-700">
            <Link href={`/dashboard/leagues/${id}/edit`}>
              <Edit className="mr-1.5 h-3 w-3" />
              Edit
            </Link>
          </Button>
          <LeagueActions leagueId={id} status={league.status} />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700/60 dark:bg-zinc-900">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">Members</p>
          <p className="mt-1 text-2xl font-extralight tabular-nums text-zinc-800 dark:text-zinc-100">{league._count.memberships}</p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700/60 dark:bg-zinc-900">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">Rental Cost</p>
          <p className="mt-1 text-2xl font-extralight tabular-nums text-zinc-800 dark:text-zinc-100">{formatCurrency(league.gym_rental_cost)}</p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700/60 dark:bg-zinc-900">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">Collected</p>
          <p className="mt-1 text-2xl font-extralight tabular-nums text-zinc-800 dark:text-zinc-100">{formatCurrency(totalCollected)}</p>
          <p className="mt-1 text-[10px] tabular-nums text-zinc-400 dark:text-zinc-500">
            {formatCurrency(totalMembershipFees)} + {formatCurrency(totalGuestFees)} guest
          </p>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700/60 dark:bg-zinc-900">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">Guest Fee</p>
          <p className="mt-1 text-2xl font-extralight tabular-nums text-zinc-800 dark:text-zinc-100">{formatCurrency(league.guest_fee_per_game)}</p>
          <p className="mt-1 text-[10px] text-zinc-400 dark:text-zinc-500">per game</p>
        </div>
      </div>

      {/* Season & Payment Schedule */}
      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700/60 dark:bg-zinc-900">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">Season</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-zinc-600 dark:text-zinc-300">
            <div className="flex justify-between">
              <span className="text-xs text-zinc-400">Start</span>
              <span className="tabular-nums">{new Date(league.start_date).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-zinc-400">End</span>
              <span className="tabular-nums">{new Date(league.end_date).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="mt-4 border-t border-zinc-100 pt-3 dark:border-zinc-800">
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500">Expected Revenue</p>
            <p className="mt-1 text-xl font-extralight tabular-nums text-zinc-800 dark:text-zinc-100">{formatCurrency(expectedFromMembers)}</p>
            <p className="mt-0.5 text-[10px] tabular-nums text-zinc-400 dark:text-zinc-500">
              {league._count.memberships > 0 ? `${formatCurrency(Math.floor(expectedFromMembers / league._count.memberships))} avg/member` : 'No members yet'}
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700/60 dark:bg-zinc-900">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">Due Dates</p>
          <div className="mt-3 flex flex-col gap-1.5">
            {paymentDueDates.map((date, index) => {
              const isPast = new Date(date) < new Date()
              return (
                <div key={date} className="flex items-center justify-between rounded-lg border border-zinc-100 px-3 py-2 dark:border-zinc-800">
                  <span className="text-xs tabular-nums text-zinc-600 dark:text-zinc-300">
                    #{index + 1} &middot;{' '}
                    {new Date(date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  {isPast ? <CheckCircle className="h-3.5 w-3.5 text-green-500" /> : <Clock className="h-3.5 w-3.5 text-zinc-400" />}
                </div>
              )
            })}
          </div>
        </section>
      </div>

      {/* Members */}
      <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700/60 dark:bg-zinc-900">
        <MembershipsList leagueId={id} memberships={league.memberships} />
      </section>
    </div>
  )
}
