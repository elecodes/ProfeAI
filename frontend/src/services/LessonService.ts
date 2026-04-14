import { db } from "../config/firebase";
import { collection, getDocs, query, where, doc, setDoc, getDoc } from "firebase/firestore";
import { Lesson } from "../types";

const COLLECTION_NAME = "lessons";

/**
 * Service to manage educational content (Lessons) in Firestore.
 * Handles fetching curriculum content based on proficiency levels.
 */
export const LessonService = {
  /**
   * Fetch general lesson for a specific level (e.g., 'beginner_general')
   * @param {string} level - 'beginner', 'intermediate', or 'advanced'
   * @returns {Promise<Lesson | null>} - The general lesson object or null
   */
  async getGeneralLesson(level: string): Promise<Lesson | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, `${level}_general`);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Lesson;
      }
      
      return null;
    } catch (error) {
      console.error("Error fetching general lesson from Firestore:", error);
      throw error;
    }
  },

  /**
   * Fetch all lessons for a specific level (legacy - gets ALL documents with that level)
   * @param {string} level - 'beginner', 'intermediate', or 'advanced'
   * @returns {Promise<Lesson[]>} - Array of lesson objects
   */
  async getLessons(level: string): Promise<Lesson[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where("level", "==", level) // Ensure your Firestore documents have a 'level' field
      );
      
      const querySnapshot = await getDocs(q);
      const lessons: Lesson[] = [];
      
      querySnapshot.forEach((doc) => {
        lessons.push({
          id: doc.id,
          ...doc.data()
        } as Lesson);
      });
      
      return lessons;
    } catch (error) {
      console.error("Error fetching lessons from Firestore:", error);
      throw error;
    }
  },

  /**
   * Add or overwrite a lesson (used for seeding/admin)
   * @param {string} id - Unique ID for the lesson (e.g., 'beginner_food')
   * @param {Lesson} lessonData - The lesson content
   */
  async setLesson(id: string, lessonData: Lesson): Promise<void> {
    try {
      await setDoc(doc(db, COLLECTION_NAME, id), lessonData);
      console.log(`Lesson ${id} written successfully.`);
    } catch (error) {
      console.error("Error writing lesson:", error);
      throw error;
    }
  }
};

export default LessonService;
