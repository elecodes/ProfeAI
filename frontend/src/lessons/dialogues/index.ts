import { Dialogue } from "../../types/dialogue";

export const dialogues: Record<string, Dialogue[]> = {
  beginner: [
    {
      id: "beg_1",
      title: "Presentaciones (Introductions)",
      lines: [
        { speaker: "Ana", text: "Hola, me llamo Ana. ¿Cómo te llamas?", translation: "Hi, my name is Ana. What is your name?", gender: "female" },
        { speaker: "Juan", text: "Hola Ana. Yo soy Juan. Mucho gusto.", translation: "Hi Ana. I am Juan. Nice to meet you.", gender: "male" },
        { speaker: "Ana", text: "El gusto es mío. ¿De dónde eres?", translation: "The pleasure is mine. Where are you from?", gender: "female" },
        { speaker: "Juan", text: "Soy de México. ¿Y tú?", translation: "I am from Mexico. And you?", gender: "male" },
        { speaker: "Ana", text: "Soy de España.", translation: "I am from Spain.", gender: "female" }
      ]
    },
    {
      id: "beg_2",
      title: "En el restaurante (At the restaurant)",
      lines: [
        { speaker: "Camarero", text: "Buenas noches. ¿Qué van a tomar?", translation: "Good evening. What will you have?", gender: "male" },
        { speaker: "Cliente", text: "Para mí, un agua por favor.", translation: "For me, a water please.", gender: "female" },
        { speaker: "Camarero", text: "¿Y para comer?", translation: "And to eat?", gender: "male" },
        { speaker: "Cliente", text: "Quiero la ensalada de la casa.", translation: "I want the house salad.", gender: "female" }
      ]
    }
  ],
  intermediate: [
    {
      id: "int_1",
      title: "Planes para el fin de semana (Weekend plans)",
      lines: [
        { speaker: "Luis", text: "¿Qué vas a hacer este fin de semana?", translation: "What are you going to do this weekend?", gender: "male" },
        { speaker: "María", text: "Creo que iré al cine el sábado. ¿Te apuntas?", translation: "I think I'll go to the movies on Saturday. Want to join?", gender: "female" },
        { speaker: "Luis", text: "Me encantaría, pero tengo que estudiar.", translation: "I would love to, but I have to study.", gender: "male" },
        { speaker: "María", text: "¡Qué pena! Bueno, quizás la próxima semana.", translation: "What a pity! Well, maybe next week.", gender: "female" }
      ]
    }
  ],
  advanced: [
    {
      id: "adv_1",
      title: "Debate sobre tecnología (Technology debate)",
      lines: [
        { speaker: "Sofia", text: "Creo que la inteligencia artificial cambiará el mundo radicalmente.", translation: "I think artificial intelligence will radically change the world.", gender: "female" },
        { speaker: "Carlos", text: "Estoy de acuerdo, aunque me preocupan las implicaciones éticas.", translation: "I agree, although I am worried about the ethical implications.", gender: "male" },
        { speaker: "Sofia", text: "Es cierto, necesitamos regulaciones claras para evitar el mal uso.", translation: "It's true, we need clear regulations to avoid misuse.", gender: "female" },
        { speaker: "Carlos", text: "Exacto, el equilibrio entre innovación y seguridad es clave.", translation: "Exactly, the balance between innovation and safety is key.", gender: "male" }
      ]
    }
  ]
};
