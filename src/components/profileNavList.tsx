"use client";
import Link from "next/link";
import { Links } from "@/types/navLinks";
import { usePathname } from "next/navigation";

export default function ProfileNavList() {
  const pathname = usePathname();

  const profileSections: Links[] = [
    { label: "General", href: "/profile" },
    { label: "Attendance", href: "/profile/attendance" },
    { label: "Stats", href: "/profile/stats" },
    { label: "Memberships", href: "/profile/memberships" },
    { label: "Settings", href: "/profile/settings" },
  ];

  return (
    <nav className="-mx-2 border-b border-zinc-200 dark:border-zinc-700/60">
      <div className="-mb-px flex gap-0 overflow-x-auto scrollbar-none">
        {profileSections.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              href={link.href}
              key={link.href as string}
              className={`relative whitespace-nowrap px-4 py-3 text-[13px] font-medium transition-colors ${
                isActive
                  ? "text-basket-400"
                  : "text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
              }`}
            >
              {link.label}
              {isActive && (
                <span className="absolute inset-x-0 bottom-0 h-[2px] bg-basket-400" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
