import Link from 'next/link'
import { lastTenGamesFromUserRegistration } from '@/actions/gameActions'

export default async function ProfileDashboardGameHistoryParallel() {
  const { lastTenGames, user } = await lastTenGamesFromUserRegistration()

  return (
    <div>
      {/* Section header */}
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-500 dark:text-zinc-400">
          {lastTenGames?.length === 0 ? 'No games yet' : `Last ${lastTenGames?.length} ${lastTenGames?.length === 1 ? 'game' : 'games'}`}
        </h3>
        <Link href="/profile/attendance" className="text-[11px] text-zinc-400 transition-colors hover:text-basket-400 dark:text-zinc-500">
          View all
        </Link>
      </div>

      {/* Attendance dots */}
      {lastTenGames && lastTenGames.length > 0 && (
        <div className="flex items-center gap-2.5">
          {lastTenGames.map((game, index) => {
            const wasPlaying = game.game_registrations.some(registration => registration.user_id === user?.id)
            return (
              <div key={index} className="group relative flex flex-col items-center">
                <div
                  className={`h-3.5 w-3.5 rounded-full transition-transform hover:scale-125 ${
                    wasPlaying ? 'bg-emerald-500 shadow-sm shadow-emerald-500/30' : 'bg-zinc-200 dark:bg-zinc-700'
                  }`}
                />
              </div>
            )
          })}
        </div>
      )}

      {/* Legend */}
      {lastTenGames && lastTenGames.length > 0 && (
        <div className="mt-3 flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500">Attended</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-zinc-200 dark:bg-zinc-700" />
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500">Missed</span>
          </div>
        </div>
      )}
    </div>
  )
}
