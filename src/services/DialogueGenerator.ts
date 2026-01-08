import { ChatOpenAI } from "@langchain/openai";
import { DialogueSchema, Dialogue } from "../types";
import { Runnable } from "@langchain/core/runnables";

class DialogueGenerator {
  private model: ChatOpenAI;
  // Using explicit type for structuredModel might be complex as it depends on the schema output,
  // but Runnable<string, z.infer<typeof DialogueSchema>> is a good guess if using LC expression language,
  // or simply 'any' or inferred if too complex for now. The .withStructuredOutput returns a Runnable.
  private structuredModel: Runnable<string, any>; // Relaxed type for now to avoid deep generic issues

  constructor() {
    this.model = new ChatOpenAI({
      modelName: "gpt-4o-mini", // Cost-effective and fast
      temperature: 0.7,
    });

    // @ts-ignore - langchain types can be tricky with structured output
    this.structuredModel = this.model.withStructuredOutput(DialogueSchema);
  }

  async generate(topic: string, level: string): Promise<Dialogue> {
    const prompt = `
      Generate a realistic dialogue in Spanish for a student of level "${level}".
      Topic: "${topic}".
      
      Requirements:
      - The dialogue should have between 4 and 6 lines.
      - Use vocabulary appropriate for the level.
      - Include English translations.
      - Assign a gender ("male" or "female") to each speaker.
      - IMPORTANT: Ensure the speaker's name matches the assigned gender (e.g., Juan = male, Maria = female).
    `;
    
    try {
      // The result should match the schema (z.infer<typeof DialogueSchema>)
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
