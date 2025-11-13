import { auth } from "@/auth";

export async function isAuthenticated() {
  const session = await auth();
  return !!session?.user;
}

export async function getServerSession() {
  return await auth();
}

export async function getCurrentUser() {
  const session = await auth();
  return session?.user || null;
}
