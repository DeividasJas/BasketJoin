import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

export default async function ProfileDashboardLayout({
  stats,
  profile,
  gameHistory,
}: {
  stats: React.ReactNode;
  profile: React.ReactNode;
  gameHistory: React.ReactNode;
}) {
  const { isAuthenticated } = getKindeServerSession();
  const isLoggedIn = await isAuthenticated();

  if (!isLoggedIn) {
    redirect("/api/auth/login");
  }

  await setTimeout(() => {}, 10000);

  if (isLoggedIn) {
    return (
      <>
        <div className="mt-6 flex w-full flex-col gap-2 p-1 sm:grid sm:grid-cols-2">
          <section className="rounded-md border border-zinc-400 dark:border-zinc-600 px-2 py-2 shadow-md shadow-zinc-400 dark:shadow-zinc-800 focus:border-[rgb(150,91,54)] sm:min-w-full">
            {isLoggedIn && stats}
          </section>
          {/* profile section */}

          <section className="rounded-md border border-zinc-400 dark:border-zinc-600 px-2 py-2 shadow-md shadow-zinc-400 dark:shadow-zinc-800 focus:border-[rgb(150,91,54)] sm:min-w-full">
            {isLoggedIn && profile}
          </section>

          {/* game section */}
          <section className="rounded-md border border-zinc-400 dark:border-zinc-600 px-2 py-2 shadow-md shadow-zinc-400 dark:shadow-zinc-800 focus:border-[rgb(150,91,54)] sm:min-w-full">
            {isLoggedIn && gameHistory}
          </section>
        </div>
      </>
    );
  }
}
