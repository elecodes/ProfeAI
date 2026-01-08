import { ChatOpenAI } from "@langchain/openai";
import { InMemoryChatMessageHistory } from "@langchain/core/chat_history";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { env } from "../config/env.js";
import { z } from "zod";

const ResponseSchema = z.object({
  text: z.string(),
  gender: z.enum(["male", "female"]),
});

type Response = z.infer<typeof ResponseSchema>;
class ConversationService {
  private model: ChatOpenAI;
  private messageHistories: Map<string, InMemoryChatMessageHistory>;

  constructor() {
    this.model = new ChatOpenAI({
      openAIApiKey: env.OPENAI_API_KEY,
      modelName: "gpt-4o-mini",
      temperature: 0.7,
    });
    this.messageHistories = new Map();
  }

  getHistory(sessionId: string): InMemoryChatMessageHistory {
    if (!this.messageHistories.has(sessionId)) {
      this.messageHistories.set(sessionId, new InMemoryChatMessageHistory());
    }
    return this.messageHistories.get(sessionId)!;
  }

  async _generateResponse(sessionId: string, input: string, topic: string, level: string): Promise<Response> {
    const history = this.getHistory(sessionId);
    // const messages = await history.getMessages(); // Unused

    // Manual message construction to avoid LangChain Template hangs
    const systemInstruction = `You are a language tutor roleplaying a scenario.
    SCENARIO: ${topic}
    USER LEVEL: ${level}
    
    INSTRUCTIONS:
    1. Act as a character appropriate for the scenario.
    2. Respond in Spanish.
    3. Keep responses concise (1-2 sentences).
    4. You MUST return your response in valid JSON format with the following structure:
       {{
         "text": "Your response in Spanish",
         "gender": "male" or "female"
       }}
    5. Do NOT include any markdown formatting. Just the raw JSON object.`;

    // Get previous messages (assuming history works, if not we'll use local array)
    const storedMessages = await history.getMessages();
    
    const finalMessages = [
      new SystemMessage(systemInstruction),
      ...storedMessages, // These should already be BaseMessage objects
      new HumanMessage(input)
    ];

    // Add user message to history
    await history.addUserMessage(input);

    try {
      // Invoke model directly with manual messages
      const result = await this.model.invoke(finalMessages);
      
      // Parse JSON
        let content = result.content as string;
        try {
          content = content.replace(/```json/g, "").replace(/```/g, "").trim();
          const parsedJSON = JSON.parse(content);
          
          // Validate with Zod
          const parsed = ResponseSchema.parse(parsedJSON);
          
          // Add AI response to history
          await history.addAIMessage(parsed.text);
          
          return parsed;
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        // Fallback
        await history.addAIMessage(content);
        return { text: content, gender: "female" };
      }
    } catch (error) {
      console.error("Generation Error:", error);
      
      // FALLBACK STRATEGY: If OpenAI fails (Rate Limit 429, etc), use simulated response
      console.warn("⚠️ Switching to Fallback Simulation due to API Error");
      return this._getFallbackResponse(topic, input);
    }
  }

  _getFallbackResponse(topic: string, input: string): Response {
    // Simple keyword matching to simulate conversation
    const lowerInput = input.toLowerCase();
    let text = "Hola, ¿en qué puedo ayudarte?";
    let gender: "male" | "female" = "male";

    // Scenario: Restaurant
    if (topic.toLowerCase().includes("restaurant") || topic.toLowerCase().includes("comida") || topic.toLowerCase().includes("food")) {
        if (input.includes("Start") || input.includes("Hola")) {
            text = "¡Hola! Bienvenido a nuestro restaurante. ¿Mesa para uno?";
        } else if (lowerInput.includes("mesa") || lowerInput.includes("table")) {
            text = "Perfecto. Aquí tiene el menú. ¿Qué desea beber?";
        } else if (lowerInput.includes("carta") || lowerInput.includes("menu")) {
            text = "Tenemos paella, gazpacho y tortilla. ¿Qué le apetece?";
        } else if (lowerInput.includes("cuenta") || lowerInput.includes("bill")) {
            text = "En seguida se la traigo. ¿Pagará con tarjeta?";
        } else {
            text = "¿Desea algo más?";
        }
        gender = "male";
    }
    // Scenario: Doctor
    else if (topic.toLowerCase().includes("doctor") || topic.toLowerCase().includes("medico")) {
         if (input.includes("Start") || input.includes("Hola")) {
            text = "Buenos días. Soy el doctor Pérez. ¿Qué le duele hoy?";
            gender = "male";
        } else {
            text = "Entiendo. Vamos a recetarle algo para el dolor. ¿Tiene alergias?";
            gender = "male";
        }
    }
    // Default / Generic
    else {
        if (input.includes("Start")) {
             text = "¡Hola! ¿De qué te gustaría hablar hoy sobre " + topic + "?";
             gender = "female";
        } else {
             text = "Interesante. Cuéntame más, por favor. (Modo simulación activado por límite de API)";
             gender = "female";
        }
    }

    return { text, gender };
  }

  async startConversation(sessionId: string, topic: string, level: string) {
    this.messageHistories.set(sessionId, new InMemoryChatMessageHistory());
    // For start, we don't add the user instruction to history as a visible message usually,
    // but here we treat it as the initiating system prompt trigger.
    // Actually, we can just trigger the generation.
    
    return await this._generateResponse(
      sessionId, 
      "Start the conversation and introduce yourself regarding the topic.", 
      topic, 
      level
    );
  }

  async sendMessage(sessionId: string, message: string, topic: string, level: string) {
    return await this._generateResponse(sessionId, message, topic, level);
  }
}

export default new ConversationService();
