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
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Location Management</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            {totalLocations} location{totalLocations !== 1 ? "s" : ""} total
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/locations/new" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add New Location
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
