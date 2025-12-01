import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/utils/prisma";
import RescheduleForm from "@/components/admin/RescheduleForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function ReschedulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user) {
    redirect("/login");
  }

  const userRole = session.user.role;
  if (userRole !== "ADMIN" && userRole !== "ORGANIZER") {
    redirect("/");
  }

  const game = await prisma.games.findUnique({
    where: { id: parseInt(id) },
    include: {
      location: true,
      _count: {
        select: {
          game_registrations: {
            where: { status: "CONFIRMED" },
          },
        },
      },
    },
  });

  if (!game) {
    redirect("/admin");
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <Link
        href="/dashboard/locations"
        className="mb-4 inline-flex items-center gap-1 text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Games
      </Link>
      <h1 className="mb-6 text-3xl font-bold">Reschedule Game</h1>

      <div className="mb-6 rounded-lg bg-zinc-100 p-4 dark:bg-zinc-800">
        <h2 className="mb-2 font-bold">Current Game Details:</h2>
        <p>Date: {new Date(game.game_date).toLocaleString()}</p>
        <p>Location: {game.location.name}</p>
        <p>Registered Players: {game._count.game_registrations}</p>
      </div>

      <RescheduleForm
        gameId={game.id}
        currentDate={game.game_date}
        playerCount={game._count.game_registrations}
      />
    </div>
  );
}
