import { getAllLocationsForAdmin } from "@/actions/adminLocationActions";
import AdminLocationsList from "@/components/admin/AdminLocationsList";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import PaginationControls from "@/components/paginationControls";
import { z } from "zod";
import { Plus } from "lucide-react";

export default async function AdminLocationsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;

  const searchParamsSchema = z.object({
    page: z.coerce.number().default(1),
    pageSize: z.coerce.number().default(10),
    search: z.string().optional(),
    city: z.string().optional(),
    isActive: z.enum(["all", "active", "inactive"]).default("all"),
  });

  const { page, pageSize, search, city, isActive } =
    searchParamsSchema.parse(resolvedSearchParams);

  const {
    locations,
    totalLocations,
    page: currentPage,
    pageSize: currentPagesize,
    cities,
  } = await getAllLocationsForAdmin(page, pageSize, { search, city, isActive });

  const totalPages = Math.ceil(totalLocations / currentPagesize);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
            Locations
          </h1>
          <p className="mt-0.5 text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
            {totalLocations} location{totalLocations !== 1 ? "s" : ""} total
          </p>
        </div>
        <Button
          variant="outline"
          asChild
          className="h-8 border-zinc-200 text-xs dark:border-zinc-700"
        >
          <Link
            href="/dashboard/locations/new"
            className="flex items-center gap-1.5"
          >
            <Plus className="h-3 w-3" />
            New Location
          </Link>
        </Button>
      </div>

      <AdminLocationsList
        locations={locations}
        cities={cities}
        totalLocations={totalLocations}
        pageSize={currentPagesize}
      />
      <PaginationControls currentPage={currentPage} totalPages={totalPages} />
    </div>
  );
}
