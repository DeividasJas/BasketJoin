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
          <div className="flex flex-col place-items-center rounded-md">
            <ProfileNavList />
            {children}
          </div>
        </ProfileProvider>
      </>
    );
  }
}
