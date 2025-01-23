'use server'
import { cookies } from "next/headers";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export const getUserId = async () => {
    try {
      const cookieStore = await cookies();
      let userId = cookieStore.get("userId")?.value;
  
      if (!userId) {
        const { getUser } = getKindeServerSession();
        const kindeUser = await getUser();
        userId = kindeUser?.id;
      }
  
      if (!userId) throw new Error("No user ID available");
  
      return userId;
    } catch (error: any) {
      console.error("Error getting user ID:", error);
      throw error; // Re-throw the error instead of returning error message
    }
  };