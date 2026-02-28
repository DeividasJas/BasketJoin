import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/utils/prisma";
import LeagueForm from "@/components/admin/LeagueForm";

export default async function NewLeaguePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const user = await prisma.users.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") {
    redirect("/schedule");
  }

  const allLocations = await prisma.locations.findMany({
    where: { is_active: true },
    select: {
      id: true,
      name: true,
      address: true,
      city: true,
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New League</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Set up a new league with schedule and payment configuration
        </p>
      </div>

      <LeagueForm allLocations={allLocations} />
    </div>
  );
}
