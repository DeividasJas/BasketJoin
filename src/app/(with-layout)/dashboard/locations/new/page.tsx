import { auth } from "@/auth";
import { redirect } from "next/navigation";
import LocationForm from "@/components/admin/LocationForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewLocationPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userRole = session.user.role;
  if (userRole !== "ADMIN" && userRole !== "ORGANIZER") {
    redirect("/");
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <Link
        href="/dashboard/locations"
        className="mb-4 inline-flex items-center gap-1 text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Locations
      </Link>
      <h1 className="mb-6 text-3xl font-bold">Add New Location</h1>
      <LocationForm mode="create" />
    </div>
  );
}
