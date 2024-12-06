import type { Metadata } from "next";
import ProfileNavList from "@/components/profileNavList";
import { ProfileProvider, useProfileContext } from "@/context/profileContext";
import { ReactNode } from "react";

// type ProfileSections = {
//   general: string;
//   attendance: string;
//   stats: string;
//   settings: string;
//   notifications: string;
//   logout: string;
// };

type ProfileSection = {
  title: string;
  href: string;
};

const profileSections: ProfileSection[] = [
  {
    title: "Dashboard",
    href: "/profile/dashboard",
  },
  {
    title: "General",
    href: "/profile",
  },
  {
    title: "Stats",
    href: "/profile/stats",
  },
  {
    title: "Settings",
    href: "/profile/settings",
  },
  // {
  //   title: 'Notifications',
  //   href: '/profile/notifications',
  // },
];
export default function LayoutProfile({
  children,
  stats,
}: {
  children: ReactNode;
  stats: ReactNode;
}) {
  return (
    <>
      <div className="mt-8 flex flex-col place-items-center rounded-md bg-zinc-900 px-2 py-6">
        <ProfileNavList profileSections={profileSections} />
        {children}
        {/* <div className="border-4 border-red-500">{stats}</div> */}
      </div>
    </>
  );
}
