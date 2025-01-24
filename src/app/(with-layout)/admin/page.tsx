import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

export default async function Admin() {
  const { getPermission, isAuthenticated } = getKindeServerSession();

  const isLoggedIn = await isAuthenticated();
  if (!isLoggedIn) redirect("/api/auth/login");
  const requiredPermissions = await getPermission("add:game");
  if (!requiredPermissions?.isGranted) redirect("/");

  return (
    <>
      <h1 className="text-center text-3xl font-bold">Admin Page</h1>
    </>
  );
}
