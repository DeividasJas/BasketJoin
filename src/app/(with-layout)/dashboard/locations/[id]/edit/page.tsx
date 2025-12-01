import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/utils/prisma";
import LocationForm from "@/components/admin/LocationForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
    redirect("/dashboard/locations");
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
      <h1 className="mb-6 text-3xl font-bold">Edit Location</h1>
      <LocationForm mode="edit" location={location} />
    </div>
  );
}
