import { redirect } from "next/navigation";
import ProfileNavList from "@/components/profileNavList";
import { ProfileProvider } from "@/context/profileContext";
import { auth } from "@/auth";

export default async function LayoutProfile({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <ProfileProvider>
      <div className="mx-auto max-w-[900px] rounded-md bg-zinc-300 px-2 dark:bg-zinc-900">
        <ProfileNavList />
        {children}
      </div>
    </ProfileProvider>
  );
}
