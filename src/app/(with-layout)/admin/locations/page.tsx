import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAllLocationsForAdmin } from "@/actions/adminLocationActions";
import AdminLocationsList from "@/components/admin/AdminLocationsList";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function AdminLocationsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userRole = session.user.role;
  if (userRole !== "ADMIN" && userRole !== "ORGANIZER") {
    redirect("/");
  }

  const { locations, cities } = await getAllLocationsForAdmin();

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6">
      {/* Back button */}
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Admin Dashboard
      </Link>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Location Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {locations.length} location{locations.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/locations/new">➕ Add New Location</Link>
        </Button>
      </div>

      <AdminLocationsList initialLocations={locations} cities={cities} />
    </div>
  );
}
