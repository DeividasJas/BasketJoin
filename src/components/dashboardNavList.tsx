"use client";
import Link from "next/link";
import { Links } from "@/types/navLinks";
import { usePathname } from "next/navigation";

export default function DashboardNavList({ userRole }: { userRole: string }) {
  const pathname = usePathname();

  const dashboardSections: Links[] = [
    { label: "Games", href: "/dashboard/games" },
    { label: "Locations", href: "/dashboard/locations" },
    { label: "Leagues", href: "/dashboard/leagues" },
    { label: "Payments", href: "/dashboard/payments" },
    ...(userRole === "ADMIN"
      ? [{ label: "Admin", href: "/dashboard/admin" } as Links]
      : []),
  ];

  return (
    <nav className="border-b border-zinc-200 dark:border-zinc-700/60">
      <ul className="flex gap-0 overflow-x-auto">
        {dashboardSections.map((link) => {
          const isActive = pathname.startsWith(link.href as string);
          return (
            <li key={link.href as string}>
              <Link
                href={link.href}
                className={`relative block px-4 py-2.5 text-[13px] font-medium transition-colors ${
                  isActive
                    ? "text-basket-400"
                    : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute inset-x-2 bottom-0 h-[2px] rounded-full bg-basket-400" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
