// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { 
  getAuth, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  signOut,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Autenticación
export const auth = getAuth(app);

// Default persistence
setPersistence(auth, browserLocalPersistence).catch((err) => console.error("Firebase persistence error:", err));

// Firestore (lo usaremos para memoria del usuario)
export const db = getFirestore(app);

// Providers (Google login opcional)
export const googleProvider = new GoogleAuthProvider();

// Funciones para Login / Signup
export const emailSignup = (email: string, password: string) =>
  createUserWithEmailAndPassword(auth, email.trim(), password);

export const emailLogin = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email.trim(), password);

export const googleLogin = () => signInWithPopup(auth, googleProvider);

export const logout = () => signOut(auth);

export const resetPassword = (email: string) => 
  sendPasswordResetEmail(auth, email);

export const setAuthPersistence = async (remember: boolean) => {
  try {
    const mode = remember ? browserLocalPersistence : browserSessionPersistence;
    await setPersistence(auth, mode);
  } catch (err: any) {
    console.error("Error updating persistence:", err.message);
  }
};