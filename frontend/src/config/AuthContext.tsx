import React, { createContext, useState, useEffect, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "./firebase";
import UserService from "../services/UserService";
import { AppUser } from "../types";

export interface AuthContextType {
  user: User | null;
  userProfile: AppUser | null;
  loading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  setUserProfile: React.Dispatch<React.SetStateAction<AppUser | null>>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const profile = await UserService.getUserProfile(firebaseUser.uid);
          if (profile) {
            setUserProfile(profile);
          } else {
            await UserService.createUserProfile(firebaseUser);
            const newProfile = await UserService.getUserProfile(firebaseUser.uid);
            setUserProfile(newProfile);
          }
        } catch (err) {
          console.error("AuthContext Profile Error:", err);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile, 
      loading, 
      error, 
      setError, 
      setLoading,
      setUserProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
}
