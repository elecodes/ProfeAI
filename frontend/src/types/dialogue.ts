import { z } from "zod";

export const DialogueLineSchema = z.object({
  speaker: z.string().describe("Name of the speaker"),
  text: z.string().describe("The text spoken in Spanish"),
  translation: z.string().describe("English translation of the text"),
  gender: z.enum(["male", "female"]).describe("Gender of the speaker for TTS"),
});

export type DialogueLine = z.infer<typeof DialogueLineSchema>;

export const DialogueSchema = z.object({
  title: z.string().describe("The title of the dialogue in Spanish"),
  lines: z.array(DialogueLineSchema).describe("The lines of the dialogue"),
});

export type Dialogue = z.infer<typeof DialogueSchema> & {
  id: string; // We explicitly add ID in the generator
};

export type GenerateDialogueParams = {
  topic: string;
  level: string;
};
