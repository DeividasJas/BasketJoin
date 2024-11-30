'use client';
import { getUserById } from '@/actions/actions';
import { useKindeBrowserClient } from '@kinde-oss/kinde-auth-nextjs';
import { createContext, useState, useContext, useEffect } from 'react';

// Define the context type
interface MyContextType {
  profile: object;
  setProfile: (value: object) => void;
}

const MyContext = createContext<MyContextType | undefined>(undefined);

// Create a provider component
export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null); // Shared state


  return (
    <MyContext.Provider value={{ profile, setProfile }}>
      {children}
    </MyContext.Provider>
  );
};

export const useProfileContext = (): MyContextType => {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error('useProfileContext must be used within a MyProvider');
  }
  return context;
};
