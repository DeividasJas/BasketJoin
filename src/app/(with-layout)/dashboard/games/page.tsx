import { getAllGamesForAdmin } from "@/actions/adminGameActions";
import AdminGamesList from "@/components/admin/AdminGamesList";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminGamesPage() {
  const { games } = await getAllGamesForAdmin();

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Game Management</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            {games.length} game{games.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/games/new">➕ Create New Game</Link>
        </Button>
      </div>

      <AdminGamesList games={games} />
    </div>
  );
}
