import { z } from "zod";

export const GrammarReportSchema = z.object({
  score: z.number().min(0).max(100).describe("A score from 0 to 100"),
  corrections: z.array(z.object({
    original: z.string().describe("Text with error"),
    corrected: z.string().describe("Corrected version"),
    explanation: z.string().describe("Grammar rule explanation"),
    type: z.enum(["grammar", "vocabulary", "spelling", "punctuation"])
  })),
  generalFeedback: z.string().describe("Overall tips")
});

export type GrammarReport = z.infer<typeof GrammarReportSchema>;
