import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { getLatestGameId } from "@/actions/actions";
import { navLinks as navLinksArray } from "@/types/navLinks";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const dynamicNavLinksFunction = async () => {
  const { success, game } = await getLatestGameId();
  if (!success) return { success, navLinksArray };

  const dynamicNavLinksArray = navLinksArray.map((link) => {
    if (link.label === "Status") {
      return { ...link, href: `/game-status${success ? `/${game?.id}` : ""}` };
    } else {
      return link;
    }
  });
  return { success, dynamicNavLinksArray };
};


