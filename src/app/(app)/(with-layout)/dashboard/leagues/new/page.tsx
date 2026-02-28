import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/utils/prisma";
import LeagueForm from "@/components/admin/LeagueForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewLeaguePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const user = await prisma.users.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") {
    redirect("/schedule");
  }

  const allLocations = await prisma.locations.findMany({
    where: { is_active: true },
    select: {
      id: true,
      name: true,
      address: true,
      city: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="mx-auto w-full max-w-2xl flex flex-col gap-6">
      <Link
        href="/dashboard/leagues"
        className="inline-flex items-center gap-1 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
      >
        <ArrowLeft className="h-3 w-3" />
        Leagues
      </Link>
      <div>
        <h1 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
          New League
        </h1>
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
          Configure schedule and payment settings
        </p>
      </div>
      <LeagueForm allLocations={allLocations} />
    </div>
  );
}
