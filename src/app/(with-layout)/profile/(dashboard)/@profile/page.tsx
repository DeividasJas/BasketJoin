import Link from "next/link";
import Image from "next/image";
import { Settings } from "lucide-react";
import { findCurrentUser } from "@/actions/userActions";

export default async function ProfileDashboardProfileParallel() {
  const { success, user, message } = await findCurrentUser();
  
  if (!success) return <div>{message}</div>;

  return (
    <div className="relative flex h-full w-full flex-col">
      <div className="flex h-full w-full flex-col items-center justify-center">
        {user?.picture && (
          <Image
            src={user?.picture}
            alt="Player picture"
            width={100}
            height={100}
            priority={true}
            className="mb-2 rounded-md"
          />
        )}
        <p>{user?.given_name}</p>
        <p>{user?.family_name}</p>
        {user?.username && <p>{user?.username}</p>}
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
