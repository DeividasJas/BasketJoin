"use server";

import { prisma } from "@/utils/prisma";
import { auth } from "@/auth";

export const getUserId = async () => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return undefined;
    }

    return session.user.id;
  } catch (error: any) {
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return null;
    }

    const user = await prisma.users.findUnique({
      where: {
        id: session.user.id,
      },
    });

    return user;
  } catch (error: any) {
    return null;
  }
};

export const findCurrentUser = async () => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return { success: false, message: "User not found" };
    }

    return { success: true, user };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

export const updateUserForm: any = async (formData: FormData) => {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, message: "Not authenticated" };
    }

    const formDataObj = Object.fromEntries(formData);

    const updatedUser = await prisma.users.update({
      where: {
        id: session.user.id,
      },
      data: {
        family_name: formDataObj.familyName as string,
        given_name: formDataObj.givenName as string,
        username: formDataObj.username as string,
        phone_number: formDataObj.phoneNumber as string,
      },
    });

    if (!updatedUser) {
      return { success: false, message: "Could not update user" };
    }

    return { success: true, updatedUser, message: "User updated successfully" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};
