import { doc, setDoc, getDoc, updateDoc, serverTimestamp, arrayUnion, DocumentData, Timestamp } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { AppUser, LearnedPhrase, StudySession } from "../types";

/**
 * Service to handle user data in Firestore
 */
const UserService = {
  /**
   * Create or update user profile in Firestore
   * @param {any} user - Firebase Auth user object (using any for now as auth types are external)
   * @param {Object} additionalData - Extra data to save
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
   * Get user profile data
   * @param {string} uid - User ID
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
   * Update user progress (level, learned phrases, etc.)
   * @param {string} uid - User ID
   * @param {Partial<AppUser>} data - Data to update
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
   * Add a learned phrase to the user's list
   * @param {string} uid - User ID
   * @param {LearnedPhrase} phrase - Phrase object
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
   * Record a study session in history
   * @param {string} uid - User ID
   * @param {StudySession} sessionData - Session details
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
   * Calculate unlocked weeks based on user creation date
   * @param {AppUser} user - User object with createdAt timestamp
   * @returns {number} Max unlocked week number
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
