"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Links } from "@/types/navLinks";


export default function Header({
  isAuthenticated,
  navLinksArray,
  permissions,
}: {
  isAuthenticated: boolean;
  navLinksArray: Links[];
  permissions: string[] | undefined;
}) {
  const pathname = usePathname();

  const navLinks = navLinksArray.map(({ href, label, requiredPermissions }) => {
    if (href == "/") {
      return (
        <li key={href} className="flex items-center">
          <Link href="/">
            <Image
              src={"/basketball.svg"}
              width="30"
              height="30"
              alt="basketball"
              priority={true}
            />
          </Link>
        </li>
      );
    }
    if (
      !requiredPermissions ||
      requiredPermissions.every((perm) => permissions?.includes(perm)) ||
      isAuthenticated
    ) {
      return (
        <li
          key={href as string}
          className={`rounded-md px-3 py-2 bg-zinc-800 outline outline-2 outline-zinc-700 transition-all duration-500 sm:px-4 sm:py-3 ${pathname == href && "outline-stone-500 scale-105"}`}>
          <Link href={href}>{label}</Link>
        </li>
      );
    }
  });


  return (
    <header className="fixed bottom-0 left-0 right-0 z-50 order-last rounded-t-sm bg-zinc-800 sm:relative sm:order-first sm:border-none sm:bg-transparent">
      <nav className="mx-auto max-w-[700px]">
        <ul className="flex items-center justify-around rounded border-zinc-900 py-3">
          {navLinks}
        </ul>
      </nav>
    </header>
  );
}
