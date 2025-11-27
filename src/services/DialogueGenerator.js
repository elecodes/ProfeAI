import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";

// Define the schema for the output
const dialogueSchema = z.object({
  title: z.string().describe("The title of the dialogue in Spanish"),
  lines: z.array(
    z.object({
      speaker: z.string().describe("Name of the speaker"),
      text: z.string().describe("The text spoken in Spanish"),
      translation: z.string().describe("English translation of the text"),
      gender: z.enum(["male", "female"]).describe("Gender of the speaker for TTS"),
    })
  ).describe("The lines of the dialogue"),
});

class DialogueGenerator {
  constructor() {
    this.model = new ChatOpenAI({
      modelName: "gpt-4o-mini", // Cost-effective and fast
      temperature: 0.7,
    });
    
    this.structuredModel = this.model.withStructuredOutput(dialogueSchema);
  }

  async generate(topic, level) {
    const prompt = `
      Generate a realistic dialogue in Spanish for a student of level "${level}".
      Topic: "${topic}".
      
      Requirements:
      - The dialogue should have between 4 and 6 lines.
      - Use vocabulary appropriate for the level.
      - Include English translations.
      - Assign a gender to each speaker for Text-to-Speech purposes.
    `;

    try {
      const result = await this.structuredModel.invoke(prompt);
      // Add a random ID to the dialogue
      return {
        ...result,
        id: `gen_${Date.now()}`,
      };
    } catch (error) {
      console.error("Error generating dialogue:", error);
      throw new Error("Failed to generate dialogue");
    }
  }
}

export default new DialogueGenerator();
