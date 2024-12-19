import ProfileNavList from "@/components/profileNavList";
import { ReactNode } from "react";
import { ProfileProvider } from "@/context/profileContext";

export default async function LayoutProfile({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <ProfileProvider>
        <div className="mt-8 flex flex-col place-items-center rounded-md bg-zinc-900 px-2 py-6">
          <ProfileNavList />
          {children}
        </div>
      </ProfileProvider>
    </>
  );
}
