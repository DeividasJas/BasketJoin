import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/utils/prisma'
import { demoFilter } from '@/lib/demo'
import { format } from 'date-fns'
import { Check, X, MapPin } from 'lucide-react'

export default async function AttendancePage() {
  const session = await auth()
  if (!session?.user) redirect('/login')

  const userId = session.user.id
  const isDemo = await demoFilter()

  // Fetch all past games the user could have attended (since account creation)
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { created_at: true },
  })

  if (!user) redirect('/login')

  const allPastGames = await prisma.games.findMany({
    where: {
      game_date: {
        gte: user.created_at,
        lte: new Date(),
      },
      status: { in: ['COMPLETED', 'IN_PROGRESS'] },
      is_demo: isDemo,
    },
    include: {
      location: { select: { name: true } },
      league: { select: { id: true, name: true } },
      game_registrations: {
        where: { user_id: userId },
        select: { status: true, registration_type: true },
      },
    },
    orderBy: { game_date: 'desc' },
  })

  // Group games by league (null league = standalone)
  const grouped = new Map<string, { name: string; games: typeof allPastGames }>()

  for (const game of allPastGames) {
    const key = game.league?.id ?? '__standalone__'
    const label = game.league?.name ?? 'Pickup Games'

    if (!grouped.has(key)) {
      grouped.set(key, { name: label, games: [] })
    }
    grouped.get(key)!.games.push(game)
  }

  const sections = Array.from(grouped.entries())

  if (allPastGames.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500 dark:text-zinc-400">Attendance</h2>
        <div className="flex flex-col items-center py-12">
          <p className="text-sm text-zinc-500">No past games to show yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500 dark:text-zinc-400">Attendance</h2>

      {sections.map(([key, { name, games }]) => {
        const attended = games.filter(g => g.game_registrations[0]?.status === 'CONFIRMED').length
        const total = games.length

        return (
          <div key={key}>
            {/* League / group header */}
            <div className="mb-3 flex items-baseline justify-between">
              <h3 className="text-[13px] font-medium text-zinc-700 dark:text-zinc-200">{name}</h3>
              <span className="text-[11px] tabular-nums text-zinc-400 dark:text-zinc-500">
                {attended}/{total} attended
              </span>
            </div>

            {/* Attendance rate bar */}
            <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700/60">
              <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${total > 0 ? (attended / total) * 100 : 0}%` }} />
            </div>

            {/* Game list */}
            <div className="flex flex-col gap-1.5">
              {games.map(game => {
                const reg = game.game_registrations[0]
                const didAttend = reg?.status === 'CONFIRMED'
                const regType = reg?.registration_type

                return (
                  <div key={game.id} className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                    {/* Status indicator */}
                    <div
                      className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${
                        didAttend ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500'
                      }`}
                    >
                      {didAttend ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                    </div>

                    {/* Game info */}
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-medium text-zinc-700 dark:text-zinc-200">{format(game.game_date, 'EEE, MMM d')}</span>
                        <span className="text-[11px] text-zinc-400 dark:text-zinc-500">{format(game.game_date, 'h:mm a')}</span>
                      </div>
                      {game.location && (
                        <span className="flex items-center gap-1 text-[11px] text-zinc-400 dark:text-zinc-500">
                          <MapPin className="h-2.5 w-2.5" />
                          {game.location.name}
                        </span>
                      )}
                    </div>

                    {/* Registration type badge */}
                    {didAttend && regType && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          regType === 'MEMBER' ? 'bg-basket-400/10 text-basket-400' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}
                      >
                        {regType === 'MEMBER' ? 'Member' : 'Guest'}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
