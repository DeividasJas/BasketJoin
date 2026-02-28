import { getAllGamesForAdmin } from "@/actions/adminGameActions";
import AdminGamesList from "@/components/admin/AdminGamesList";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import PaginationControls from "@/components/paginationControls";
import { z } from "zod";
import { Plus } from "lucide-react";

export default async function AdminGamesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;

  const searchParamsSchema = z.object({
    page: z.coerce.number().default(1),
    pageSize: z.coerce.number().default(10),
    status: z.enum(["scheduled", "completed", "cancelled"]).optional(),
    leagueId: z.string().optional(),
  });

  const { page, pageSize, status, leagueId } = searchParamsSchema.parse(resolvedSearchParams);

  const {
    games,
    totalGames,
    allLeagues,
    page: currentPage,
    pageSize: currentPagesize,
  } = await getAllGamesForAdmin(page, pageSize, { status, leagueId });

  const totalPages = Math.ceil(totalGames / currentPagesize);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
            Games
          </h1>
          <p className="mt-0.5 text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
            {totalGames} game{totalGames !== 1 ? "s" : ""} total
          </p>
        </div>
        <Button
          variant="outline"
          asChild
          className="h-8 border-zinc-200 text-xs dark:border-zinc-700"
        >
          <Link href="/dashboard/games/new" className="flex items-center gap-1.5">
            <Plus className="h-3 w-3" />
            New Game
          </Link>
        </Button>
      </div>

      <AdminGamesList
        games={games}
        pageSize={currentPagesize}
        allLeagues={allLeagues}
        currentStatus={status}
        currentLeagueId={leagueId}
      />
      <PaginationControls currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}
