import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAllLocations } from "@/actions/adminGameActions";
import { prisma } from "@/utils/prisma";
import GameForm from "@/components/admin/GameForm";

export default async function EditGamePage({
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

  const [{ locations }, game] = await Promise.all([
    getAllLocations(),
    prisma.games.findUnique({
      where: { id: parseInt(id) },
    }),
  ]);

  if (!game) {
    redirect("/admin");
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Edit Game</h1>
      <GameForm locations={locations} mode="edit" game={game} />
    </div>
  );
}
