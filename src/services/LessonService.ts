import { db } from "../../firebase/firebase";
import { collection, getDocs, query, where, doc, setDoc } from "firebase/firestore";
import { Lesson } from "../types";

const COLLECTION_NAME = "lessons";

export const LessonService = {
  /**
   * Fetch all lessons for a specific level
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
