import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

export default async function Admin() {
  const { getPermission, isAuthenticated } = getKindeServerSession();

  const requiredPermissions = await getPermission("add:game");
  const isLoggedIn = await isAuthenticated();
  //   console.log(isLoggedIn, requiredPermissions);

  if (!isLoggedIn) redirect("/api/auth/login");
  if (!requiredPermissions?.isGranted) redirect("/");

  return (
    <>
      <div className="mx-auto mt-10 max-w-[900px] rounded-md bg-zinc-900 px-2 py-6">
        <h1>admin page</h1>
      </div>
    </>
  );
}
