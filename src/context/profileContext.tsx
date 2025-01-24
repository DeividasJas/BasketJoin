"use client";
import { findCurrentUser } from "@/actions/userActions";
import { Users as User } from "@prisma/client";
import { createContext, useState, useContext, useEffect } from "react";
import { toast } from "sonner";

interface MyContextType {
  user: User | null;
  setUser: any;
  updateUser: any;
}

const MyContext = createContext<MyContextType | undefined>(undefined);

// Create a provider component
export const ProfileProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(null);

  const updateUser = (updatedUser: any) => {
    setUser((prev: any) => ({ ...prev, ...updatedUser }));
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { user } = await findCurrentUser();
        if (!user) {
          toast.error("User not found");
          return;
        }
        setUser(user);
      } catch (error: any) {
        console.error(error.message);
        toast.error(error.message);
      }
    };
    fetchUser();
  }, []);
  return (
    <MyContext.Provider value={{ user, setUser, updateUser }}>
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
