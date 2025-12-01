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
    <div className="w-full max-w-2xl mx-auto px-4 py-6">
      <Link
        href="/admin/games"
        className="inline-flex items-center gap-1 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Games
      </Link>
      <h1 className="text-3xl font-bold mb-6">Reschedule Game</h1>

      <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-4 mb-6">
        <h2 className="font-bold mb-2">Current Game Details:</h2>
        <p>Date: {new Date(game.game_date).toLocaleString()}</p>
        <p>Location: {game.location.name}</p>
        <p>Registered Players: {game._count.game_registrations}</p>
      </div>

      <RescheduleForm gameId={game.id} currentDate={game.game_date} playerCount={game._count.game_registrations} />
    </div>
  );
}
