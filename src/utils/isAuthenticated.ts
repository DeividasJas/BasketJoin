import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function isAuthenticatedKindeServer() {
  const { isAuthenticated } = getKindeServerSession();
  const isAuthMethod = await isAuthenticated();

  return isAuthMethod;
}
