import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getAllLocations } from "@/actions/adminGameActions";
import GameForm from "@/components/admin/GameForm";

export default async function NewGamePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userRole = session.user.role;
  if (userRole !== "ADMIN" && userRole !== "ORGANIZER") {
    redirect("/");
  }

  const { locations } = await getAllLocations();

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Create New Game</h1>
      <GameForm locations={locations} mode="create" />
    </div>
  );
}
