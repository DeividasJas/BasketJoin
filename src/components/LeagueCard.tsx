'use client'

import Link from 'next/link'
import { MapPin, Users } from 'lucide-react'
import { formatCurrency } from '@/lib/paymentFormatUtils'

type LeagueCardProps = {
  league: {
    id: string
    name: string
    status: string
    start_date: Date
    end_date: Date
    gym_rental_cost: number
    guest_fee_per_game: number
    location: {
      name: string
      city: string
    }
    _count: {
      memberships: number
      games: number
    }
  }
}

export default function LeagueCard({ league }: LeagueCardProps) {
  const statusStyle: Record<string, string> = {
    UPCOMING: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    ACTIVE: 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400',
    COMPLETED: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400',
    CANCELLED: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
  }

  return (
    <Link href={`/leagues/${league.id}`} className="group">
      <div className="rounded-xl border border-zinc-200 bg-white p-5 transition-colors hover:border-zinc-300 dark:border-zinc-700/60 dark:bg-zinc-900 dark:hover:border-zinc-600">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold text-zinc-800 transition-colors group-hover:text-basket-400 dark:text-zinc-100">{league.name}</h3>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusStyle[league.status] || 'bg-zinc-100 text-zinc-500'}`}
          >
            {league.status}
          </span>
        </div>

        <div className="mt-3 flex flex-col gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">
              {league.location.name}, {league.location.city}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Users className="h-3 w-3 shrink-0" />
            <span className="tabular-nums">
              {league._count.memberships} members &middot; {league._count.games} games
            </span>
          </div>

          <p className="tabular-nums">
            {new Date(league.start_date).toLocaleDateString()} &ndash; {new Date(league.end_date).toLocaleDateString()}
          </p>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
          <span className="text-[11px] text-zinc-400 dark:text-zinc-500">Membership</span>
          <span className="text-sm font-semibold tabular-nums text-zinc-800 dark:text-zinc-100">{formatCurrency(league.gym_rental_cost)}</span>
        </div>
      </div>
    </Link>
  )
}
