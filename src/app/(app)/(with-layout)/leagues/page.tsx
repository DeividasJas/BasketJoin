import { getBrowsableLeagues } from '@/actions/leagueActions'
import LeagueCard from '@/components/LeagueCard'
import { Calendar } from 'lucide-react'

export default async function LeaguesPage() {
  const { success, leagues } = await getBrowsableLeagues()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">Leagues</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Browse and join basketball leagues</p>
      </div>

      {!success || leagues.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-200 p-12 text-center dark:border-zinc-700/60">
          <Calendar className="mx-auto h-8 w-8 text-zinc-300 dark:text-zinc-600" />
          <p className="mt-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">No leagues available</p>
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">Check back later for upcoming leagues</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {leagues.map(league => (
            <LeagueCard key={league.id} league={league} />
          ))}
        </div>
      )}
    </div>
  )
}
