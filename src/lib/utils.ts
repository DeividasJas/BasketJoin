import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { getLatestGameId } from "@/actions/actions";
import { navLinks as navLinksArray } from "@/types/navLinks";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const dynamicNavLinksFunction = async (isAuth: boolean) => {
  const { success, game } = await getLatestGameId();

  if (!success)
    return {
      success,
      navLinks: navLinksArray,
    };

  const dynamicNavLinksArray = navLinksArray.map((link) =>
    link.label === "Status"
      ? { ...link, href: `/game-status${success ? `/${game?.id}` : ""}` }
      : link,
  );

  return {
    success,
    navLinks: dynamicNavLinksArray,
  };
};
