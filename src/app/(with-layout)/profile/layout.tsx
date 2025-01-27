import { redirect } from "next/navigation";
import ProfileNavList from "@/components/profileNavList";
import { ProfileProvider } from "@/context/profileContext";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export default async function LayoutProfile({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = getKindeServerSession();
  const isLoggedIn = await isAuthenticated();
  if (!isLoggedIn) {
    redirect("/api/auth/login");
  } else {
    return (
      <>
        <ProfileProvider>
          <div className="mx-auto max-w-[900px] rounded-md bg-zinc-300 px-2 dark:bg-zinc-900">
            <ProfileNavList />
            {children}
          </div>
        </ProfileProvider>
      </>
    );
  }
}
