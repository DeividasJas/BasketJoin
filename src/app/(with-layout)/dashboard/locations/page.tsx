import { getAllLocationsForAdmin } from "@/actions/adminLocationActions";
import AdminLocationsList from "@/components/admin/AdminLocationsList";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminLocationsPage() {
  const { locations, cities } = await getAllLocationsForAdmin();

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Location Management</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            {locations.length} location{locations.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/locations/new">➕ Add New Location</Link>
        </Button>
      </div>

      <AdminLocationsList initialLocations={locations} cities={cities} />
    </div>
  );
}
