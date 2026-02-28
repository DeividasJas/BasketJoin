import { getBrowsableLeagues } from "@/actions/leagueActions";
import LeagueCard from "@/components/LeagueCard";
import { Calendar } from "lucide-react";

export default async function LeaguesPage() {
  const { success, leagues } = await getBrowsableLeagues();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Available Leagues</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Browse and join basketball leagues in your area
        </p>
      </div>

      {!success || leagues.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium">No leagues available</h3>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Check back later for upcoming leagues
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {leagues.map((league) => (
            <LeagueCard key={league.id} league={league} />
          ))}
        </div>
      )}
    </div>
  );
}
