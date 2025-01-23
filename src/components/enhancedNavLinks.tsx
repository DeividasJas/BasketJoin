import { getLatestGameId } from "@/actions/actions";
import { Links, navLinks } from "@/types/navLinks";
export default async function EnhancedNavLinks() {
  const { success, game } = await getLatestGameId();

  const dynamicStatusLink: Links = {
    label: "Status",
    href: `/status${success ? `/${game?.id}` : ""}`,
    requiredPermissions: ["regular:user"],
  };

  // Insert the dynamic status link at the appropriate position
  const enhancedNavLinks = [...navLinks];
  navLinks.splice(2, 0, dynamicStatusLink);

  return enhancedNavLinks;
}
