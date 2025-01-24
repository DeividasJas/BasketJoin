import { Url } from "next/dist/shared/lib/router/router";

export type Links = {
  label?: string;
  href: Url;
  requiresAuth?: boolean;
  requiredPermissions?: string[];
  postOperation?: Url;
};
export const navLinks: Links[] = [
  {
    // label: 'About',
    href: "/",
  },
  {
    label: "Schedule",
    href: "/schedule",
  },
  {
    label: "Status",
    href: "/game-status",
    // requiredPermissions: ["regular:user"],
  },
  {
    label: "Profile",
    href: "/profile",
    // requiredPermissions: ["regular:user"],
  },
  {
    label: "Admin",
    href: "/admin",
    requiredPermissions: ["add:game"],
  },
  {
    label: "Login",
    href: "/api/auth/login",
    postOperation: "/",
  },
  {
    label: "Signup",
    href: "/api/auth/register",
    postOperation: "/",
  },
];
