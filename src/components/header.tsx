"use client";
import { navLinks } from "@/types/navLinks";
import Link from "next/link";
import Image from "next/image";
import NavLinkBox from "./navLinkBox";

export default function Header({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  const getFilteredLinks = () => {
    return navLinks.filter((link) => {
      if (link.label === "Login" || link.label === "Signup") {
        return !isAuthenticated;
      }
      if (link.label === "Profile") return isAuthenticated;
      if (link.label === "Logout") return isAuthenticated;
      return true;
    });
  };

  return (
    <header className="fixed bottom-0 left-0 right-0 z-50 order-last bg-zinc-900 sm:relative sm:order-first sm:bg-transparent sm:pb-0">
      <nav className="mx-auto max-w-[700px]">
        <ul className="flex items-center justify-around rounded border-zinc-900 py-2">
          <li>
            <Link href="/" className="flex items-center">
              <Image
                src={"/basketball.svg"}
                width="30"
                height="30"
                alt="basketball"
              />
            </Link>
          </li>
          {getFilteredLinks().map((link) => (
            <NavLinkBox key={link.label} link={link} />
          ))}
        </ul>
      </nav>
    </header>
  );
}
