import { z } from 'zod';

export const generateDialogueSchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters long"),
  level: z.enum(["beginner", "intermediate", "advanced"]).optional().default("intermediate"),
});

export const ttsSchema = z.object({
  text: z.string().min(1, "Text is required"),
  language: z.string().optional(), // Más flexible
  options: z
    .object({
      gender: z.string().optional(), // Cambiamos enum por string para evitar errores de validación si llega vacío
      speed: z.number().optional(),
    })
    .optional()
    .default({}), // Valor por defecto para que no sea undefined
});

export const grammarAnalysisSchema = z.object({
  text: z.string().min(1, "Text is required"),
  context: z.string().optional().default("General conversation"),
});
