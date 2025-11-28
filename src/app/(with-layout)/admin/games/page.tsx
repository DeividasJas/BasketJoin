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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Game Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {games.length} game{games.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link
          href="/admin/games/new"
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          ➕ Create New Game
        </Link>
      </div>

      <AdminGamesList games={games} />
    </div>
  );
}
