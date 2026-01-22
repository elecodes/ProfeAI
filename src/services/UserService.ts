import { doc, setDoc, getDoc, updateDoc, serverTimestamp, arrayUnion } from "firebase/firestore";
import { db } from "../../firebase/firebase.js";
import { AppUser, LearnedPhrase, StudySession } from "../types";

/**
 * Service to handle user data in Firestore.
 * Manages profiles, progress tracking, and study history.
 */
const UserService = {
  /**
   * Create or update user profile in Firestore.
   * If usage already exists, updates the `lastActive` timestamp.
   * 
   * @param user - Firebase Auth user object.
   * @param additionalData - Extra fields to merge into the profile.
   * @returns Reference to the user document.
   */
  async createUserProfile(user: any, additionalData: any = {}): Promise<any> {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const { email, displayName, photoURL } = user;
      const createdAt = serverTimestamp();

      try {
        const newUserProfile: Partial<AppUser> = {
          uid: user.uid,
          email,
          displayName,
          photoURL,
          createdAt,
          lastActive: createdAt,
          level: "beginner",
          learnedPhrases: [],
          history: [],
          preferences: {
            theme: "light",
            notifications: true
          },
          ...additionalData
        };

        await setDoc(userRef, newUserProfile);
      } catch (error) {
        console.error("Error creating user profile", error);
      }
    } else {
      // Update last active
      await updateDoc(userRef, {
        lastActive: serverTimestamp()
      });
    }

    return userRef;
  },

  /**
   * Retrieves the full user profile data.
   * 
   * @param uid - The User ID to fetch.
   * @returns User profile data or null if not found.
   */
  async getUserProfile(uid: string): Promise<AppUser | null> {
    if (!uid) return null;
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        return userSnap.data() as AppUser;
      }
    } catch (error) {
      console.error("Error fetching user profile", error);
    }
    return null;
  },

  /**
   * Updates specific fields in the user's progress.
   * Automatically updates `lastActive`.
   * 
   * @param uid - User ID.
   * @param data - Partial data to update (e.g. level, theme).
   */
  async updateUserProgress(uid: string, data: Partial<AppUser>): Promise<void> {
    if (!uid) return;
    try {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        ...data,
        lastActive: serverTimestamp()
      });
    } catch (error) {
      console.error("Error updating user progress", error);
    }
  },

  /**
   * Adds a new phrase to the user's "Learned" collection.
   * Uses `arrayUnion` to prevent duplicates.
   * 
   * @param uid - User ID.
   * @param phrase - The phrase object to add.
   */
  async addLearnedPhrase(uid: string, phrase: LearnedPhrase): Promise<void> {
    if (!uid) return;
    try {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        learnedPhrases: arrayUnion(phrase),
        lastActive: serverTimestamp()
      });
    } catch (error) {
      console.error("Error adding learned phrase", error);
    }
  },

  /**
   * Records a completed study session (Quiz, Dialogue, etc.).
   * 
   * @param uid - User ID.
   * @param sessionData - details of the session (score, type, duration).
   */
  async recordSession(uid: string, sessionData: StudySession): Promise<void> {
    if (!uid) return;
    try {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        history: arrayUnion({
          ...sessionData,
          date: new Date().toISOString()
        }),
        lastActive: serverTimestamp()
      });
    } catch (error) {
      console.error("Error recording session", error);
    }
  },
  /**
   * Calculates how many weeks/levels are unlocked based on user account age.
   * Unlocks 1 new week every 7 days.
   * 
   * @param user - User profile containing `createdAt`.
   * @returns The number of weeks currently available.
   */
  getUnlockedWeeks(user: AppUser): number {
    if (!user || !user.createdAt) return 1;

    // Convert Firestore Timestamp to Date
    // Check if it has toDate() method (Firestore Timestamp) or if it's already a date or string
    let created: Date;
    
    if (user.createdAt && typeof (user.createdAt as any).toDate === 'function') {
        created = (user.createdAt as any).toDate();
    } else {
        created = new Date(user.createdAt);
    }
    
    const now = new Date();
    
    // Calculate days difference
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Unlock 1 week every 7 days (Week 1 is always unlocked)
    // Days 0-6: Week 1
    // Days 7-13: Week 1, 2
    // etc.
    const weeksUnlocked = Math.floor(diffDays / 7) + 1;
    
    return weeksUnlocked;
  }
};

export default UserService;
