// src/data/lessons.ts

export interface LessonData {
  spanish: string;
  english: string;
}

export const lessons: Record<string, LessonData[]> = {
  beginner: [
    {
      spanish: "Hola, ¿cómo estás?",
      english: "Hello, how are you?",
    },
    {
      spanish: "Me gusta aprender idiomas.",
      english: "I like learning languages.",
    },
    {
      spanish: "Nos vemos mañana.",
      english: "See you tomorrow.",
    },
  ],
  intermediate: [
    {
      spanish: "Ayer fui al cine con mis amigos.",
      english: "Yesterday I went to the cinema with my friends.",
    },
    {
      spanish: "He estado estudiando español por dos años.",
      english: "I have been studying Spanish for two years.",
    },
  ],
  advanced: [
    {
      spanish: "Aunque estaba cansado, terminé el proyecto a tiempo.",
      english: "Although I was tired, I finished the project on time.",
    },
    {
      spanish: "Si hubiera sabido la respuesta, la habría dicho.",
      english: "If I had known the answer, I would have said it.",
    },
  ],
};
