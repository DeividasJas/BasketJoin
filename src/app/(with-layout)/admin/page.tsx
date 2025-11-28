import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Admin() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Check if user has ADMIN or ORGANIZER role
  const userRole = session.user.role;
  const hasAdminAccess = userRole === "ADMIN" || userRole === "ORGANIZER";

  if (!hasAdminAccess) {
    redirect("/");
  }

  return (
    <>
      <h1 className="text-center text-3xl font-bold">Admin Page</h1>
      <p className="text-center mt-4">Welcome, {userRole}!</p>
    </>
  );
}
