export const loadLessons = async (nivel) => {
  try {
    const globs = {
      beginner: import.meta.glob("/src/lessons/beginner/*.json", {
        eager: true,
      }),
      intermediate: import.meta.glob("/src/lessons/intermediate/*.json", {
        eager: true,
      }),
      advanced: import.meta.glob("/src/lessons/advanced/*.json", {
        eager: true,
      }),
    };

    const modules = globs[nivel];
    if (!modules) {
      console.warn(`No se encontraron módulos para el nivel: ${nivel}`);
      return [];
    }

    // Convertir módulos a lecciones con la estructura correcta
    const lessons = Object.entries(modules).map(([path, mod]) => {
      // Acceder al contenido del JSON (puede estar en mod.default o directamente en mod)
      const jsonContent = mod.default || mod;

      // Obtener nombre del archivo sin extensión
      const fileName = path.split("/").pop().replace(".json", "");

      return {
        weekName: jsonContent.title || fileName, // Usar title del JSON o nombre del archivo
        file: path.split("/").pop(),
        items: jsonContent.sentences || [], // Las frases están en "sentences"
        ...jsonContent, // Incluir todo el contenido del JSON
      };
    });

    console.log(
      `✅ Cargadas ${lessons.length} lecciones para ${nivel}:`,
      lessons
    );
    return lessons;
  } catch (e) {
    console.error("❌ Error cargando lecciones:", e);
    return [];
  }
};
