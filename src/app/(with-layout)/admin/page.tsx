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
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          Welcome, {userRole}!
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6 flex gap-4">
        <Link
          href="/admin/games"
          className="rounded-md bg-zinc-300 px-6 py-3 text-center text-zinc-900 outline outline-1 outline-zinc-400 transition-colors hover:bg-zinc-400 dark:bg-zinc-700 dark:text-zinc-100 dark:outline-zinc-600 dark:hover:bg-zinc-600"
        >
          <div className="mb-1 text-2xl">🎮</div>
          <div className="font-bold">Games</div>
          <div className="text-xs opacity-90">Manage game schedule</div>
        </Link>

        <Link
          href="/admin/locations"
          className="rounded-md bg-zinc-300 px-6 py-3 text-center text-zinc-900 outline outline-1 outline-zinc-400 transition-colors hover:bg-zinc-400 dark:bg-zinc-700 dark:text-zinc-100 dark:outline-zinc-600 dark:hover:bg-zinc-600"
        >
          <div className="mb-1 text-2xl">📍</div>
          <div className="font-bold">Locations</div>
          <div className="text-xs opacity-90">Manage venues</div>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="rounded-lg bg-zinc-100 p-6 dark:bg-zinc-800">
        <h2 className="mb-4 text-xl font-bold">Quick Access</h2>
        <div className="space-y-2">
          <Link
            href="/admin/games"
            className="block text-zinc-700 hover:underline dark:text-zinc-300"
          >
            View all games
          </Link>
          <Link
            href="/admin/locations"
            className="block text-zinc-700 hover:underline dark:text-zinc-300"
          >
            View all locations
          </Link>
          <Link
            href="/admin/games/new"
            className="block text-zinc-700 hover:underline dark:text-zinc-300"
          >
            Create new game
          </Link>
          <Link
            href="/admin/locations/new"
            className="block text-zinc-700 hover:underline dark:text-zinc-300"
          >
            Add new location
          </Link>
        </div>
      </div>
    </div>
  );
}
