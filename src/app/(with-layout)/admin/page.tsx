import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Admin() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // TODO: Implement custom permissions system
  // For now, checking if user exists in session
  // Future: Check for "add:game" permission from database or JWT claims
  const hasAdminPermission = !!session?.user?.id;

  if (!hasAdminPermission) {
    redirect("/");
  }

  return (
    <>
      <h1 className="text-center text-3xl font-bold">Admin Page</h1>
    </>
  );
}
