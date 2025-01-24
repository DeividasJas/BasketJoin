"use client";
import LogoutBtn from "@/components/logoutBtn";
import { useProfileContext } from "@/context/profileContext";

import EditProfileForm from "@/components/editProfileForm";
import Image from "next/image";
import React from "react";
// import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
// import { redirect } from "next/navigation";

export default function Page() {
  // const { isAuthenticated } = useKindeBrowserClient();
  // const isLoggedIn = isAuthenticated;
  // if (!isLoggedIn) redirect("/api/auth/login");
  const { user } = useProfileContext();

  return (
    <>
      <section className="mt-6 flex h-full w-full max-w-[700px] flex-col">
        <h2 className="mb-2 text-center text-xl">Settings</h2>
        <div className="relative mb-4 flex w-full flex-col items-center justify-center gap-8 xs:flex-row">
          {user?.picture && (
            <Image
              src={user?.picture}
              width={100}
              height={100}
              alt="Player picture"
              className="w-24 self-center rounded-md md:w-24 lg:w-40" // Responsive width classes
            />
          )}
          <section className="overflow-hidden">
            <h4>Name: {user?.given_name}</h4>
            <h4>Last name: {user?.family_name}</h4>
            <h4>Username: {user?.username || "..."}</h4>
            <h4>Email: {user?.email || "..."}</h4>
            <h4>Joined: {user?.created_at?.toLocaleDateString()}</h4>
          </section>
        </div>
        <EditProfileForm />
        <LogoutBtn />
      </section>
    </>
  );
}
