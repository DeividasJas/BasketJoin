import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
          Welcome, {session.user.name}!
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="mb-6 flex gap-4">
        <Button variant="outline" asChild className="h-auto flex-1 px-6 py-3">
          <Link href="/admin/games" className="text-center">
            <div className="mb-1 text-2xl">🎮</div>
            <div className="font-bold">Games</div>
            <div className="text-xs opacity-90">Manage game schedule</div>
          </Link>
        </Button>

        <Button variant="outline" asChild className="h-auto flex-1 px-6 py-3">
          <Link href="/admin/locations" className="text-center">
            <div className="mb-1 text-2xl">📍</div>
            <div className="font-bold">Locations</div>
            <div className="text-xs opacity-90">Manage venues</div>
          </Link>
        </Button>
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
