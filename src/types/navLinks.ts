export type Links = {
  label?: string;
  href?: string;
  requiresAuth?: boolean;
  requiredPermissions?: string[];
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
    href: "/status",
    requiredPermissions: ["regular:user"],
  },
  {
    label: "Profile",
    href: "/profile",
    requiredPermissions: ["regular:user"],
  },
  {
    label: "Admin",
    href: "/admin",
    requiredPermissions: ["add:game"],
  },
  // {
  //   label: "Login",
  //   href: "/api/auth/login",
  // },
  // {
  //   label: "Signup",
  //   href: "/api/auth/signup",
  // },
];
