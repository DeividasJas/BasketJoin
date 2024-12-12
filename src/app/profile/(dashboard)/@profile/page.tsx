import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { Settings } from "lucide-react";
import Link from "next/link";

// Simulate a delay function
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function ProfileDashboardProfileParallel() {
  const { getUser } = getKindeServerSession();
  // Introduce a 5-second delay
  await delay(500);
  const user = await getUser();
  console.log(user);

  return (
    <div className="relative flex h-full w-full flex-col">
      <div className="flex flex-col items-center justify-center">
        <p>{user?.given_name}</p>
        <p>{user?.family_name}</p>
        <p>username: {user?.username}</p>
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
