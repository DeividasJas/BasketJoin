"use client";
import { signOut } from "next-auth/react";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";

export default function LogoutBtn() {
  return (
    <Button
      variant="ghost"
      className="text-red-500 transition-colors hover:bg-red-500/10 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-400"
      onClick={() => signOut({ callbackUrl: "/schedule" })}
    >
      <LogOut className="mr-1.5 h-3.5 w-3.5" />
      Sign out
    </Button>
  );
}
