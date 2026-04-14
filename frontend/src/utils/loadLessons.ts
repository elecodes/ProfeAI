import { LessonService } from "../services/LessonService";

export const loadLessons = async (nivel: string) => {
  try {
    console.log(`🔄 Fetching general lesson for ${nivel} from Firestore...`);
    const lesson = await LessonService.getGeneralLesson(nivel);

    if (!lesson) {
      console.warn(`No se encontró lección para el nivel: ${nivel}`);
      return [];
    }

    console.log(`✅ Cargada lección general para ${nivel}:`, lesson);

    // Transform into weeks format that the app expects
    const weeks = [];
    
    // Add the general lesson as a week
    if (lesson.items && lesson.items.length > 0) {
      weeks.push({
        weekName: "general",
        week: 0,
        items: lesson.items,
        quiz: lesson.quiz || []
      });
    }

    return weeks;
  } catch (e) {
    console.error("❌ Error cargando lecciones:", e);
    return [];
  }
};
