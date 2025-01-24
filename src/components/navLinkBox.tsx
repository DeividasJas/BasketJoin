import { Links } from "@/types/navLinks";
import Link from "next/link";
import {
  RegisterLink,
  LoginLink,
} from "@kinde-oss/kinde-auth-nextjs/components";

export default function NavLinkBox({ link }: { link: Links }) {
  return (
    <li className="rounded-md bg-zinc-800 px-3 py-2 sm:px-4 sm:py-3">
      {link.href ? (
        <Link href={link.href}>{link.label}</Link>
      ) : link.label === "Login" ? (
        <LoginLink>{link.label}</LoginLink>
      ) : (
        <RegisterLink>{link.label}</RegisterLink>
      )}
    </li>
  );
}
