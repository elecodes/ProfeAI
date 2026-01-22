import { LessonService } from "../services/LessonService";

export const loadLessons = async (nivel: string) => {
  try {
    console.log(`🔄 Fetching lessons for ${nivel} from Firestore...`);
    const lessons = await LessonService.getLessons(nivel);

    if (!lessons || lessons.length === 0) {
      console.warn(`No se encontraron lecciones para el nivel: ${nivel}`);
      return [];
    }

    console.log(
      `✅ Cargadas ${lessons.length} lecciones para ${nivel} desde Firestore:`,
      lessons
    );
    return lessons;
  } catch (e) {
    console.error("❌ Error cargando lecciones:", e);
    return [];
  }
};
