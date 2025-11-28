import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAllGamesForAdmin } from "@/actions/adminGameActions";
import AdminGamesList from "@/components/admin/AdminGamesList";
import Link from "next/link";

export default async function AdminGamesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userRole = session.user.role;
  if (userRole !== "ADMIN" && userRole !== "ORGANIZER") {
    redirect("/");
  }

  const { games } = await getAllGamesForAdmin();

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      {/* Back button */}
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 mb-4 transition-colors"
      >
        ← Back to Admin Dashboard
      </Link>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Game Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {games.length} game{games.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link
          href="/admin/games/new"
          className="px-4 py-2 bg-zinc-300 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-md hover:bg-zinc-400 dark:hover:bg-zinc-600 transition-colors outline outline-1 outline-zinc-400 dark:outline-zinc-600"
        >
          ➕ Create New Game
        </Link>
      </div>

      <AdminGamesList games={games} />
    </div>
  );
}
