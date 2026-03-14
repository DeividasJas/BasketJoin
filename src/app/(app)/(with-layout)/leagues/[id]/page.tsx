import { redirect, notFound } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/utils/prisma'
import { demoFilter } from '@/lib/demo'
import JoinLeagueButton from '@/components/JoinLeagueButton'
import { Calendar, MapPin, Users, FileText, CheckCircle, ArrowLeft } from 'lucide-react'
import { formatCurrency, calculateProRatedAmount } from '@/lib/paymentUtils'
import { checkLeagueMembership } from '@/actions/leagueMembershipActions'
import Link from 'next/link'

export default async function LeagueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const isDemo = await demoFilter()

  const league = await prisma.league.findUnique({
    where: { id },
    include: {
      location: true,
      _count: {
        select: {
          memberships: true,
          games: true,
        },
      },
    },
  })

  if (!league || league.is_demo !== isDemo) {
    return notFound()
  }

  const { isMember, membership } = await checkLeagueMembership(session.user.id, id)

  const paymentDueDates: string[] = JSON.parse(league.payment_due_dates)
  const proRatedCalculation = calculateProRatedAmount(league.gym_rental_cost, league.start_date, league.end_date, new Date(), paymentDueDates)

  const statusStyle: Record<string, string> = {
    UPCOMING: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    ACTIVE: 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400',
    COMPLETED: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
    CANCELLED: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
  }

  const canJoin = !isMember && (league.status === 'ACTIVE' || league.status === 'UPCOMING')

  return (
    <div className="flex flex-col gap-6">
      {/* Back link */}
      <Link
        href="/leagues"
        className="inline-flex items-center gap-1 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
      >
        <ArrowLeft className="h-3 w-3" />
        Leagues
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">{league.name}</h1>
          {league.description && <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{league.description}</p>}
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusStyle[league.status] || 'bg-zinc-100 text-zinc-500'}`}
        >
          {league.status}
        </span>
      </div>

      {/* Membership Status or Join */}
      <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700/60 dark:bg-zinc-900">
        {isMember ? (
          <div className="flex items-center gap-3">
            <CheckCircle className="h-4 w-4 shrink-0 text-green-500" />
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">You are a member</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Status: {membership?.status}</p>
            </div>
          </div>
        ) : canJoin ? (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">Join This League</p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-300">
                  Pro-rated fee: <span className="font-semibold tabular-nums text-basket-400">{formatCurrency(proRatedCalculation.totalAmount)}</span>
                </p>
                <p className="mt-0.5 text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">
                  {proRatedCalculation.percentageOfSeason.toFixed(0)}% remaining &middot; {proRatedCalculation.schedules.length} payment
                  {proRatedCalculation.schedules.length !== 1 ? 's' : ''}
                </p>
              </div>
              <JoinLeagueButton leagueId={league.id} leagueName={league.name} proRatedAmount={proRatedCalculation.totalAmount} />
            </div>
          </div>
        ) : (
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">Not accepting new members</p>
        )}
      </section>

      {/* Details Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Info */}
        <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700/60 dark:bg-zinc-900">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">Details</p>
          <div className="mt-4 flex flex-col gap-3">
            <div className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400" />
              <div>
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{league.location.name}</p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  {league.location.address}, {league.location.city}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Calendar className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400" />
              <div>
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Season</p>
                <p className="text-xs tabular-nums text-zinc-400 dark:text-zinc-500">
                  {new Date(league.start_date).toLocaleDateString()} &ndash; {new Date(league.end_date).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Users className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400" />
              <p className="text-sm tabular-nums text-zinc-700 dark:text-zinc-200">
                {league._count.memberships} members &middot; {league._count.games} games
              </p>
            </div>

            {league.game_type && (
              <div className="flex items-start gap-2.5">
                <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400" />
                <p className="text-sm text-zinc-700 dark:text-zinc-200">{league.game_type}</p>
              </div>
            )}
          </div>
        </section>

        {/* Payment */}
        <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700/60 dark:bg-zinc-900">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">Payment</p>
          <div className="mt-4 flex flex-col gap-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Membership</span>
                <span className="text-sm font-semibold tabular-nums text-zinc-800 dark:text-zinc-100">{formatCurrency(league.gym_rental_cost)}</span>
              </div>
              <p className="mt-0.5 text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">Full season &middot; {paymentDueDates.length} installments</p>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Guest fee</span>
              <span className="text-sm font-medium tabular-nums text-zinc-700 dark:text-zinc-200">{formatCurrency(league.guest_fee_per_game)}</span>
            </div>

            <div className="border-t border-zinc-100 pt-3 dark:border-zinc-800">
              <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">Due Dates</p>
              <div className="mt-2 flex flex-col gap-1">
                {paymentDueDates.slice(0, 3).map((date, index) => (
                  <p key={index} className="text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                    {new Date(date).toLocaleDateString()}
                  </p>
                ))}
                {paymentDueDates.length > 3 && <p className="text-[11px] text-zinc-400 dark:text-zinc-500">+{paymentDueDates.length - 3} more</p>}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* About */}
      {league.game_description && (
        <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700/60 dark:bg-zinc-900">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">About the Games</p>
          <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">{league.game_description}</p>
        </section>
      )}
    </div>
  )
}
