import admin from "firebase-admin";
import { env } from "../config/env";

/**
 * Initializes Firebase Admin SDK for backend Firestore access.
 * Uses GOOGLE_APPLICATION_CREDENTIALS path if available.
 */
if (!admin.apps.length) {
  try {
    if (env.GOOGLE_APPLICATION_CREDENTIALS) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
      console.log("🔥 Firebase Admin initialized successfully via Application Default Credentials.");
    } else {
      console.warn("⚠️ WARNING: GOOGLE_APPLICATION_CREDENTIALS not set. Firebase Admin may not work in production.");
      // Fallback for development if local emulator or other auth is used, 
      // but usually needs a service account in Node.
      admin.initializeApp();
    }
  } catch (error) {
    console.error("error initializing firebase admin:", error);
  }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
export default admin;
