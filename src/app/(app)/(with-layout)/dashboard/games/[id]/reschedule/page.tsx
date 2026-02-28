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
    <div className="mx-auto w-full max-w-2xl flex flex-col gap-6">
      <Link
        href="/dashboard/games"
        className="inline-flex items-center gap-1 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-600 dark:hover:text-zinc-300"
      >
        <ArrowLeft className="h-3 w-3" />
        Games
      </Link>
      <h1 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
        Reschedule Game
      </h1>

      <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-700/60 dark:bg-zinc-900">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500">
          Current Details
        </p>
        <div className="flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-300">
          <p className="tabular-nums">
            {new Date(game.game_date).toLocaleString()}
          </p>
          <p>{game.location.name}</p>
          <p className="tabular-nums text-zinc-500 dark:text-zinc-400">
            {game._count.game_registrations} registered
          </p>
        </div>
      </div>

      <RescheduleForm
        gameId={game.id}
        currentDate={game.game_date}
        playerCount={game._count.game_registrations}
      />
    </div>
  );
}
