import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/utils/prisma'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus, Calendar, Users } from 'lucide-react'
import { formatCurrency } from '@/lib/paymentUtils'

export default async function LeaguesPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const user = await prisma.users.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  if (user?.role !== 'ADMIN' && user?.role !== 'ORGANIZER') {
    redirect('/schedule')
  }

  const leagues = await prisma.league.findMany({
    include: {
      location: true,
      _count: {
        select: {
          memberships: true,
          payments: true,
          payment_schedules: true,
          games: true,
        },
      },
    },
    orderBy: { start_date: 'desc' },
  })

  const statusStyle: Record<string, string> = {
    UPCOMING: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    ACTIVE: 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400',
    COMPLETED: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
    CANCELLED: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Leagues</h1>
          <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">Manage leagues and payments</p>
        </div>
        <Button variant="outline" asChild className="h-8 border-zinc-200 text-xs dark:border-zinc-700">
          <Link href="/dashboard/leagues/new" className="flex items-center gap-1.5">
            <Plus className="h-3 w-3" />
            New League
          </Link>
        </Button>
      </div>

      {leagues.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 p-12 text-center dark:border-zinc-700/60">
          <Calendar className="mx-auto h-8 w-8 text-zinc-300 dark:text-zinc-600" />
          <p className="mt-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">No leagues yet</p>
          <Button asChild className="mt-4 bg-basket-400 text-xs text-white hover:bg-basket-300">
            <Link href="/dashboard/leagues/new">Create League</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {leagues.map(league => {
            const paymentDueDates: string[] = JSON.parse(league.payment_due_dates)

            return (
              <Link key={league.id} href={`/dashboard/leagues/${league.id}`} className="group">
                <div className="rounded-xl border border-zinc-200 bg-white p-5 transition-colors hover:border-zinc-300 dark:border-zinc-700/60 dark:bg-zinc-900 dark:hover:border-zinc-600">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-zinc-800 transition-colors group-hover:text-basket-400 dark:text-zinc-100">{league.name}</h3>
                      <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{league.location.name}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusStyle[league.status] || 'bg-zinc-100 text-zinc-500'}`}
                    >
                      {league.status}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-col gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 shrink-0" />
                      <span className="tabular-nums">
                        {new Date(league.start_date).toLocaleDateString()} &ndash; {new Date(league.end_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3 w-3 shrink-0" />
                      <span className="tabular-nums">
                        {league._count.memberships} members &middot; {league._count.games} games
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
                    <span className="text-[11px] text-zinc-400 dark:text-zinc-500">{formatCurrency(league.gym_rental_cost)}</span>
                    <span className="text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">{paymentDueDates.length} payments</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
