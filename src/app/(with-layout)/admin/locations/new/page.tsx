import { auth } from "@/auth";
import { redirect } from "next/navigation";
import LocationForm from "@/components/admin/LocationForm";

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
    <div className="w-full max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6">Add New Location</h1>
      <LocationForm mode="create" />
    </div>
  );
}
