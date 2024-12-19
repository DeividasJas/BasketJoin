"use client";
import LogoutBtn from "@/components/logoutBtn";
import { useProfileContext } from "@/context/profileContext";
import { Settings } from "lucide-react";
import EditProfileForm from "@/components/editProfileForm";

export default function Page() {
  const { user } = useProfileContext();

  return (
    <>
      <div></div>
      <section className="mt-6 flex h-full w-full flex-col border">
        <h2 className="text-center text-2xl">Settings</h2>
        <div className="relative w-full border">
          <h4>Name: {user?.givenName}</h4>
          <h4>Last name: {user?.familyName}</h4>
          {user?.username && <h4>Nickname: {user?.username}</h4>}
          <div className="absolute bottom-0 right-0">
            <p>Edit details</p>
            <Settings className="" />
          </div>
        </div>
        <EditProfileForm />
        <p>111</p>
        <LogoutBtn />
      </section>
    </>
  );
}
