"use server";

import { cookies } from "next/headers";
import { prisma } from "@/utils/prisma";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

const { getUser } = getKindeServerSession();

export const getUserId = async () => {
  try {
    const cookieStore = await cookies();
    let userId = cookieStore.get("userId")?.value;

    if (!userId) {
      const { getUser } = getKindeServerSession();
      const kindeUser = await getUser();
      userId = kindeUser?.id;
    }

    if (!userId) return;

    return userId;
  } catch (error: any) {
    console.error("Error getting user ID:", error);
    throw error; // Re-throw the error instead of returning error message
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


    if (existingUser) return { success: true, message: "User already exists" };


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

export const updateUserForm: any = async (formData: FormData) => {
  try {
    const kindeUser = await getUser();
    const formDataObj = Object.fromEntries(formData);
    // console.log(formDataObj);

    const updatedUser = await prisma.users.update({
      where: {
        id: kindeUser.id,
      },
      data: {
        family_name: formDataObj.familyName as string,
        given_name: formDataObj.givenName as string,
        // email: formDataObj.email,
        // picture: formDataObj.picture,
        username: formDataObj.username as string,
        phone_number: formDataObj.phoneNumber as string,
      },
    });

    if (!updatedUser)
      return { success: false, message: "Could not update user" };
    // revalidatePath("/profile");
    // console.log("revalidate");

    // if (updatedUser) return toast.success("User updated successfully");
    return { success: true, updatedUser, message: "User updated successfully" };
  } catch (error: any) {
    console.error(error.message);
    return { success: false, message: error.message };
  }
};
