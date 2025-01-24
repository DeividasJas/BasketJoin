import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Settings } from "lucide-react";
import { findCurrentUser } from "@/actions/userActions";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export default async function ProfileDashboardProfileParallel() {
  const { isAuthenticated } = getKindeServerSession();
  
  // Check authentication first
  const isLoggedIn = await isAuthenticated();
  
  // If not logged in, redirect to login page
  if (!isLoggedIn) {
    redirect("/api/auth/login");
  }

  // Only attempt to find user if logged in
  const { success, user, message } = await findCurrentUser();

  // Handle potential errors in user retrieval
  if (!success) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <p className="text-red-500">{message || "Unable to load user profile"}</p>
      </div>
    );
  }

  // If no user found (but authentication succeeded), you might want to handle this case
  if (!user) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <p className="text-yellow-500">User profile not found</p>
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full flex-col">
      <div className="flex h-full w-full flex-col items-center justify-center">
        {user?.picture ? (
          <Image
            src={user.picture}
            alt="Player picture"
            width={100}
            height={100}
            priority={true}
            className="mb-2 rounded-md"
          />
        ) : (
          <div className="w-[100px] h-[100px] bg-gray-200 rounded-md mb-2 flex items-center justify-center">
            No Picture
          </div>
        )}
        <p>{user.given_name}</p>
        <p>{user.family_name}</p>
        {user.username && <p>{user.username}</p>}
      </div>

      <Link
        href="/profile/settings"
        className="absolute bottom-0 right-0 ease-in"
      >
        <Settings className="duration-[6000ms] ease-in hover:animate-spin hover:stroke-basket-400" />
      </Link>
    </div>
  );
}