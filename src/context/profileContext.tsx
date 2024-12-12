"use client";
import { getCurrentUser } from "@/actions/actions";
import { User } from "@prisma/client";
import { createContext, useState, useContext, useEffect } from "react";
import { toast } from "sonner";

interface MyContextType {
  user: User | null;
  setUser: (value: User | null) => void;
}

const MyContext = createContext<MyContextType | undefined>(undefined);

// Create a provider component
export const ProfileProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser();
        if (!user.currentUser) {
          toast.error("User not found");
          return;
        }
        setUser(user.currentUser);
        console.log("SETTING user", user);
      } catch (error: any) {
        console.error(error.message);
        toast.error(error.message);
      }
    };
    fetchUser();
  }, []);
  return (
    <MyContext.Provider value={{ user, setUser }}>
      {children}
    </MyContext.Provider>
  );
};

export const useProfileContext = (): MyContextType => {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error("useProfileContext must be used within a MyProvider");
  }
  return context;
};
