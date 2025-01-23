"use server";

import { cookies } from "next/headers";
import { prisma } from "@/utils/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { getUserId } from "@/lib/serverUtils";
// import changeKindeUser from "@/utils/changeKindeUser";

const { getUser } = getKindeServerSession();

export const getUserIdFromCookies = async () => {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) return { success: false, message: "User not found" };

    return { success: true, userId };
  } catch (error: any) {
    console.error({ success: false, message: error.message });
    return { success: false, message: error.message };
  }
};

// ------------------------------------

export const addNewUser = async () => {
  try {
    const kindeUser = await getUser();
    if (!kindeUser) return { success: false, message: "User not found" };

    const existingUser = await prisma.users.findUnique({
      where: {
        id: kindeUser.id,
      },
    });

    // console.log("kinde user", kindeUser);
    if (existingUser) return { success: true, message: "User already exists" };

    // console.log("EXISTING USER", existingUser);
    if (!existingUser) {
      const user = await prisma.users.upsert({
        where: {
          id: kindeUser.id,
        },
        update: {
          email: kindeUser?.email,
          family_name: kindeUser?.family_name,
          given_name: kindeUser?.given_name,
          picture: kindeUser?.picture,
          username: kindeUser?.username,
          phone_number: kindeUser?.phone_number,
        },
        create: {
          id: kindeUser.id,
          email: kindeUser?.email,
          family_name: kindeUser?.family_name,
          given_name: kindeUser?.given_name,
          picture: kindeUser?.picture,
          username: kindeUser?.username,
          phone_number: kindeUser?.phone_number,
        },
      });

      return { success: true, user, message: "User created successfully" };
    }
  } catch (error: any) {
    console.error(error);
    return { success: false, message: error.message };
  }
};

export const findCurrentUser = async () => {
  try {
    const user_id = await getUserId();
    let user = await prisma.users.findUnique({
      where: {
        id: user_id,
      },
    });

    if (!user) {
      const kindeUser = await getUser();
      user = {
        id: kindeUser?.id,
        email: kindeUser?.email,
        family_name: kindeUser?.family_name,
        given_name: kindeUser?.given_name,
        username: kindeUser?.username || null,
        phone_number: kindeUser?.phone_number || null,
        picture: kindeUser?.picture,
        created_at: new Date(),
        modified_at: new Date(),
      };
    }
    return { success: true, user };
  } catch (error: any) {
    console.error(error);
    return { success: false, message: error.message };
  }
};
