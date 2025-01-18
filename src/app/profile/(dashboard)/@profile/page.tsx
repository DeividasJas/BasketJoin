import { getCurrentUser } from "@/actions/actions";
import { Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function ProfileDashboardProfileParallel() {
  // await delay(500);
  const userObj = await getCurrentUser();

  if (!userObj.success) return <div>{userObj.message}</div>;

  const user = userObj.currentUser;

  return (
    <div className="relative flex h-full w-full flex-col">
      <div className="flex h-full w-full flex-col items-center justify-center">
        {user?.picture && (
          <Image
            src={user?.picture}
            width={100}
            height={100}
            alt="Player picture"
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