import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAllLocations } from "@/actions/adminGameActions";
import GameForm from "@/components/admin/GameForm";
import Link from "next/link";

export default async function NewGamePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userRole = session.user.role;
  if (userRole !== "ADMIN" && userRole !== "ORGANIZER") {
    redirect("/");
  }

  const { locations } = await getAllLocations();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <Link
        href="/dashboard/locations"
        className="mb-4 inline-flex items-center gap-1 text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
      >
        ← Back to Games
      </Link>
      <h1 className="mb-6 text-3xl font-bold">Create New Game</h1>
      <GameForm locations={locations} mode="create" />
    </div>
  );
}
