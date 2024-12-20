"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ProfileNavList() {
  const pathname = usePathname();

  type ProfileSection = {
    title: string;
    href: string;
  };

  const profileSections: ProfileSection[] = [
    {
      title: "General",
      href: "/profile",
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
  ];

  return (
    <nav className="w-full px-4">
      <ul className="grid grid-cols-2 gap-3 xs:grid-cols-4">
        {profileSections.map((link) => (
          <Link
            href={link.href}
            key={link.href}
            className={`group relative block w-full rounded-lg transition-all duration-200  ${
              pathname === link.href
                ? "border-2 border-orange-400 text-orange-400"
                : "bg-zinc-800"
            }`}
          >
            <li className="px-1 py-2 text-center text-sm font-medium  sm:text-base overflow-hidden">
              {link.title}
            </li>
          </Link>
        ))}
      </ul>
    </nav>
  );
}