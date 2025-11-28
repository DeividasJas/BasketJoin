import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Admin() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Check if user has ADMIN or ORGANIZER role
  const userRole = session.user.role;
  const hasAdminAccess = userRole === "ADMIN" || userRole === "ORGANIZER";

  if (!hasAdminAccess) {
    redirect("/");
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Welcome, {userRole}!
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-4 mb-6">
        <Link
          href="/admin/games"
          className="px-6 py-3 bg-zinc-300 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-md hover:bg-zinc-400 dark:hover:bg-zinc-600 transition-colors text-center outline outline-1 outline-zinc-400 dark:outline-zinc-600"
        >
          <div className="text-2xl mb-1">🎮</div>
          <div className="font-bold">Games</div>
          <div className="text-xs opacity-90">Manage game schedule</div>
        </Link>

        <Link
          href="/admin/locations"
          className="px-6 py-3 bg-zinc-300 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-md hover:bg-zinc-400 dark:hover:bg-zinc-600 transition-colors text-center outline outline-1 outline-zinc-400 dark:outline-zinc-600"
        >
          <div className="text-2xl mb-1">📍</div>
          <div className="font-bold">Locations</div>
          <div className="text-xs opacity-90">Manage venues</div>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4">Quick Access</h2>
        <div className="space-y-2">
          <Link
            href="/admin/games"
            className="block text-zinc-700 dark:text-zinc-300 hover:underline"
          >
            → View all games
          </Link>
          <Link
            href="/admin/locations"
            className="block text-zinc-700 dark:text-zinc-300 hover:underline"
          >
            → View all locations
          </Link>
          <Link
            href="/admin/games/new"
            className="block text-zinc-700 dark:text-zinc-300 hover:underline"
          >
            → Create new game
          </Link>
          <Link
            href="/admin/locations/new"
            className="block text-zinc-700 dark:text-zinc-300 hover:underline"
          >
            → Add new location
          </Link>
        </div>
      </div>
    </div>
  );
}
