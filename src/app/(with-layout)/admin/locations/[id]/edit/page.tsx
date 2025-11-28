import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/utils/prisma";
import LocationForm from "@/components/admin/LocationForm";
import Link from "next/link";

export default async function EditLocationPage({
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

  const location = await prisma.locations.findUnique({
    where: { id: parseInt(id) },
  });

  if (!location) {
    redirect("/admin/locations");
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6">
      <Link
        href="/admin/locations"
        className="inline-flex items-center gap-1 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 mb-4 transition-colors"
      >
        ← Back to Locations
      </Link>
      <h1 className="text-3xl font-bold mb-6">Edit Location</h1>
      <LocationForm mode="edit" location={location} />
    </div>
  );
}
