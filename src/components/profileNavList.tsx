"use client";
import Link from "next/link";
import { Links } from "@/types/navLinks";
import { usePathname } from "next/navigation";

export default function ProfileNavList() {
  const pathname = usePathname();

  const profileSections: Links[] = [
    {
      label: "General",
      href: "/profile",
    },
    {
      label: "Attendance",
      href: "/profile/attendance",
    },
    {
      label: "Stats",
      href: "/profile/stats",
    },
    {
      label: "Settings",
      href: "/profile/settings",
    },
  ];

  return (
    <nav className="w-full px-4">
      <ul className="grid grid-cols-2 gap-3 xs:grid-cols-4">
        {profileSections.map((link) => (
          <Link
            href={link.href}
            key={link.href as string}
            className={`rounded-lg bg-zinc-200 transition-all duration-500 dark:bg-zinc-800 ${pathname === link.href && "outline outline-2 outline-orange-400 text-orange-600 dark:outline-orange-400 dark:text-orange-400"}`}
          >
            <li className="overflow-hidden px-1 py-2 text-center text-sm font-medium sm:text-base">
              {link.label}
            </li>
          </Link>
        ))}
      </ul>
    </nav>
  );
}
