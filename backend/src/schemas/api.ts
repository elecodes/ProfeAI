import { z } from 'zod';

export const generateDialogueSchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters long"),
  level: z.string().transform(v => v.toLowerCase()).pipe(z.enum(["beginner", "intermediate", "advanced"])).optional().default("intermediate"),
});

export type GenerateDialogueRequest = z.infer<typeof generateDialogueSchema>;

export const ttsSchema = z.object({
  text: z.string().min(1, "Text is required"),
  language: z.string().optional().default("es"),
  uid: z.string().optional(),
  options: z
    .object({
      gender: z.string().optional(), // Cambiado de enum a string para mayor flexibilidad
      speed: z.number().optional(),
    })
    .optional()
    .default({}), // Si no viene nada, enviamos un objeto vacío por defecto
});

export type TTSRequest = z.infer<typeof ttsSchema>;

export const grammarAnalysisSchema = z.object({
  text: z.string().min(1, "Text is required"),
  context: z.string().optional().default("General conversation"),
});

export type GrammarAnalysisRequest = z.infer<typeof grammarAnalysisSchema>;
