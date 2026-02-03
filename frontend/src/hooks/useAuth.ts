import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, emailLogin, emailSignup, googleLogin, logout } from "../config/firebase";
import UserService from "../services/UserService";
import { AppUser } from "../types";

export interface UseAuthReturn {
  user: User | null;
  userProfile: AppUser | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  setUserProfile: React.Dispatch<React.SetStateAction<AppUser | null>>;
}

/**
 * Hook to manage authentication state and user data
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        setUser(firebaseUser);
        
        // Create or fetch user profile in Firestore
        try {
          await UserService.createUserProfile(firebaseUser);
          const profile = await UserService.getUserProfile(firebaseUser.uid);
          setUserProfile(profile);
        } catch (err) {
          console.error("Error loading user profile:", err);
        }
      } else {
        // User is signed out
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await emailLogin(email, password);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await emailSignup(email, password);
      // Create profile immediately after signup
      if (result.user) {
        await UserService.createUserProfile(result.user);
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await googleLogin();
      if (result.user) {
        await UserService.createUserProfile(result.user);
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = async () => {
    try {
      await logout();
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  return {
    user,
    userProfile,
    loading,
    error,
    signIn,
    signUp,
    signInWithGoogle,
    signOut: signOutUser,
    setUserProfile // Allow manual updates to local profile state if needed
  };
}
