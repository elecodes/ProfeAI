import { dialogueFlow } from "../lib/genkit";
import { Dialogue } from "../types";

/**
 * Service responsible for generating educational Spanish dialogues using AI.
 * Uses the genkit library to interface with Gemini models.
 */
class DialogueGenerator {
  
  /**
   * Generates a realistic dialogue between two speakers based on a topic and difficulty level.
   * 
   * @param topic - The subject matter of the dialogue (e.g., "At the restaurant", "Asking for directions").
   * @param level - The target proficiency level (e.g., "Beginner", "Intermediate", "Advanced").
   * @returns A Promise that resolves to a {@link Dialogue} object containing the generated lines and metadata.
   * @throws {Error} If generation fails or returns empty output.
   */
  async generate(topic: string, level: string): Promise<Dialogue> {
    console.log(`⚡ Generating dialogue with Gemini: ${topic} (${level})`);
    
    try {
      const result = await dialogueFlow({
        topic,
        level
      });
      
      // Add a random ID to the dialogue
      // The result from dialogueFlow matches DialogueSchema (without ID)
      // We cast to any to safely merge id, or we could extend the type
      const dialogueWithId: Dialogue = {
        ...(result as any),
        id: `gen_${Date.now()}`,
      };
      
      return dialogueWithId;
    } catch (error) {
      console.error("Error generating dialogue with Gemini:", error);
      throw new Error("Failed to generate dialogue");
    }
  }
}

export default new DialogueGenerator();
