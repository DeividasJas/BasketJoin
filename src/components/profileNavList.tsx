"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useEffect } from "react";
import { getUserById } from "@/actions/actions";
// import { useProfileContext } from '@/context/profileContext';

export default function ProfileNavList() {
  const pathname = usePathname();

  // const { getUser, isLoading } = useKindeBrowserClient();
  // const kindeUser = getUser();

  type ProfileSection = {
    title: string;
    href: string;
  };

  const profileSections: ProfileSection[] = [
    {
      title: "General",
      href: "/profile/",
    },
    {
      title: "Attendance",
      href: "/profile/attendance",
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

  // useEffect(() => {
  //   if (isLoading) {
  //     console.log("Still loading...");
  //     return;
  //   }

  //   if (!kindeUser) {
  //     console.log("kindeUser is not available");
  //     return;
  //   }

  //   const fetchProfile = async () => {
  //     try {
  //       const profile = await getUserById(kindeUser.id);
  //       console.log("after prisma", profile);
  //       if (profile.success) {
  //         // setProfile(profile.user);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching profile:", error);
  //     }
  //   };
  //   fetchProfile();
  // }, [isLoading, kindeUser]); // Depend on isLoading and kindeUser

  return (
    <>
      <nav>
        <ul className="grid grid-cols-2 place-items-center gap-1 xs:grid-cols-4">
          {profileSections.map((link) => (
            <li
              key={link.href}
              className={`grid w-full place-items-center overflow-hidden rounded-md py-2 sm:py-2 ${
                pathname === link.href
                  ? "border border-orange-600 text-orange-700"
                  : "bg-zinc-800"
              }`}
            >
              <Link href={link.href} className="truncate">
                {link.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
