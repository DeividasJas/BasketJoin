import { Url } from "next/dist/shared/lib/router/router";

export type Links = {
  label?: string;
  href: Url;
  requiresAuth?: boolean;
  requiredRoles?: string[];
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
  },
  {
    label: "Profile",
    href: "/profile",
  },
  {
    label: "Dashboard",
    href: "/dashboard",
    requiredRoles: ["ADMIN", "ORGANIZER"],
  },
  {
    label: "Admin",
    href: "/admin",
    requiredRoles: ["ADMIN"],
  },
  {
    label: "Login",
    href: "/login",
    postOperation: "/",
  },
  {
    label: "Signup",
    href: "/signup",
    postOperation: "/",
  },
];
