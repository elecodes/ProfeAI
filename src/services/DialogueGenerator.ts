import { dialogueFlow } from "../lib/genkit";
import { Dialogue } from "../types";

class DialogueGenerator {
  
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
