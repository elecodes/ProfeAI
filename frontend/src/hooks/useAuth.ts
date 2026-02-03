import { useContext } from "react";
import { AuthContext } from "../config/AuthContext";
import { emailLogin, emailSignup, googleLogin, logout, resetPassword as firebaseResetPassword, setAuthPersistence } from "../config/firebase";
import UserService from "../services/UserService";

/**
 * Hook to consume the global authentication state and provide auth actions.
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  const { user, userProfile, loading, error, setError, setLoading, setUserProfile } = context;

  const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
    setLoading(true);
    setError(null);
    const cleanEmail = email.trim();

    if (!cleanEmail || !password) {
      setError("Email y contraseña son obligatorios.");
      setLoading(false);
      return;
    }

    try {
      await setAuthPersistence(rememberMe);
      const result = await emailLogin(cleanEmail, password);
      return result;
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    const cleanEmail = email.trim();
    try {
      await firebaseResetPassword(cleanEmail);
    } catch (err: any) {
      setError(err.message || "Error al enviar el correo.");
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
    resetPassword,
    setUserProfile
  };
}
