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
    seriesId: z.string().optional(),
  });

  const { page, pageSize, status, seriesId } = searchParamsSchema.parse(resolvedSearchParams);

  const {
    games,
    totalGames,
    allSeries,
    page: currentPage,
    pageSize: currentPagesize,
  } = await getAllGamesForAdmin(page, pageSize, { status, seriesId });

  const totalPages = Math.ceil(totalGames / currentPagesize);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Game Management</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            {totalGames} game{totalGames !== 1 ? "s" : ""} total
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/games/new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create New Game
          </Link>
        </Button>
      </div>

      <AdminGamesList
        games={games}
        pageSize={currentPagesize}
        allSeries={allSeries}
        currentStatus={status}
        currentSeriesId={seriesId}
      />
      <PaginationControls currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}
