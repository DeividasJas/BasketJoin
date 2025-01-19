"use client";
import { navLinks } from "@/types/navLinks";
import Link from "next/link";
import Image from "next/image";
import NavLinkBox from "./navLinkBox";
import {
  RegisterLink,
  useKindeBrowserClient,
} from "@kinde-oss/kinde-auth-nextjs";
import { LoginLink } from "@kinde-oss/kinde-auth-nextjs";

import { usePathname } from "next/navigation";

export default function Header({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  const pathname = usePathname();
  const { getPermissions } = useKindeBrowserClient();
  const { permissions } = getPermissions();

  return (
    <header className="fixed bottom-0 left-0 right-0 z-50 py-1 order-last bg-zinc-900 sm:relative sm:order-first sm:bg-transparent sm:pb-0 sm:pt-2">
      <nav className="mx-auto max-w-[700px]">
        <ul className="flex items-center justify-around rounded border-zinc-900 py-2">
          {navLinks.map(({ href, label, requiredPermissions }) => {
            if (href === "/") {
              return (
                <Link href="/" key={href} className="flex items-center">
                  <li>
                    <Image
                      src={"/basketball.svg"}
                      width="30"
                      height="30"
                      alt="basketball"
                    />
                  </li>
                </Link>
              );
            }
            if (
              !requiredPermissions ||
              requiredPermissions.every((perm) => permissions?.includes(perm))
            ) {
              return (
                <li key={href}>
                  <Link
                    href={`${href}`}
                    className={`rounded-md bg-zinc-800 px-3 py-2 sm:px-4 sm:py-3 ${pathname === href ? "bg-zinc-600 outline outline-zinc-600" : ""}`}
                  >
                    {label}
                  </Link>
                </li>
              );
            }
          })}

          {!isAuthenticated && (
            <>
              <li>
                <LoginLink
                  className={`rounded-md bg-zinc-800 px-3 py-2 sm:px-4 sm:py-3`}
                >
                  Login
                </LoginLink>
              </li>
              <li>
                <RegisterLink
                  className={`rounded-md bg-zinc-800 px-3 py-2 sm:px-4 sm:py-3`}
                >
                  Signup
                </RegisterLink>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}
