import { tutorFlowGemini } from "../lib/genkit";
import { InMemoryChatMessageHistory } from "@langchain/core/chat_history";
import { z } from "zod";

const ResponseSchema = z.object({
  text: z.string(),
  gender: z.enum(["male", "female"]),
  correction: z.string().optional(),
  suggestions: z.array(z.string()).optional(),
});

type Response = z.infer<typeof ResponseSchema>;

class ConversationService {
  private messageHistories: Map<string, InMemoryChatMessageHistory>;
  private lastRateLimitTimestamp: number = 0;
  private readonly CIRCUIT_BREAKER_DURATION = 5 * 60 * 1000; // 5 minutes
  
  // Vocabulary Map for simple Spanglish detection
  private vocabularyMap: Record<string, string> = {
    "vegetables": "verduras 🥦",
    "chicken": "pollo 🍗",
    "kitchen": "cocina 🍳",
    "supermarket": "supermercado 🛒",
    "store": "tienda 🏪",
    "buy": "comprar 💳",
    "want": "quiero ❤️",
    "water": "agua 💧",
    "milk": "leche 🥛"
  };

  private lastUsedFallback: string = "";

  constructor() {
    this.messageHistories = new Map();
  }

  getHistory(sessionId: string): InMemoryChatMessageHistory {
    if (!this.messageHistories.has(sessionId)) {
      this.messageHistories.set(sessionId, new InMemoryChatMessageHistory());
    }
    return this.messageHistories.get(sessionId)!;
  }

  private checkCorrections(message: string): { text: string; correction?: string } | null {
    const msg = message.toLowerCase();
    
    // 1. Spanglish Check
    for (const [english, spanish] of Object.entries(this.vocabularyMap)) {
        if (msg.includes(english)) {
            return {
                text: `He notado que usaste "${english}". En español decimos **"${spanish}"**. ¿Puedes intentar la frase de nuevo?`,
                correction: `Usa "${spanish}" en lugar de "${english}".`
            };
        }
    }

    // 2. Infinitive Error (Yo saber -> Yo sé)
    // Regex matches "yo" followed by an infinitive ending in ar/er/ir
    if (msg.match(/\byo\s+\w+(ar|er|ir)\b/i)) {
        // Special cases
        if (msg.includes("yo saber")) {
            return { text: "Casi. Para 'I know', decimos **'Yo sé'**. Inténtalo otra vez.", correction: "Yo sé" };
        }
        if (msg.includes("yo tener")) {
            return { text: "Recuerda: 'I have' es **'Yo tengo'**. ¡Prueba de nuevo!", correction: "Yo tengo" };
        }
        if (msg.includes("yo querer")) {
            return { text: "Para decir 'I want', usa **'Yo quiero'**. ¿Cómo quedaría la frase?", correction: "Yo quiero" };
        }
        if (msg.includes("yo poder")) {
             return { text: "Decimos **'Yo puedo'**. ¡Tú puedes hacerlo!", correction: "Yo puedo" };
        }
        // Generic rule
        return { 
            text: "Parece que usaste el verbo en infinitivo. Recuerda conjugarlo (ej. yo como, yo hablo).",
            correction: "Conjuga el verbo"
        };
    }

    // 3. Negation Error (no querer -> no quiero)
    if (msg.includes("no querer")) return { text: "Mejor di: **'No quiero'**.", correction: "No quiero" };
    if (msg.includes("no poder")) return { text: "La forma correcta es: **'No puedo'**.", correction: "No puedo" };

    return null;
  }



  async _generateResponse(sessionId: string, input: string, topic: string, level: string): Promise<Response> {
    // CIRCUIT BREAKER CHECK
    if (Date.now() - this.lastRateLimitTimestamp < this.CIRCUIT_BREAKER_DURATION) {
        console.log("⚡ Circuit Breaker Open: Skipping Genkit call due to recent Rate Limit.");
        throw new Error("El sistema está descansando un momento. Inténtalo de nuevo en unos segundos.");
    }

    // 5. Topic Scenarios Map
    const TOPIC_SCENARIOS: Record<string, string> = {
        "Restaurant": "You are a friendly waiter at a popular tapas bar in Madrid. It's lunch time.",
        "Restaurante": "Eres un camarero amable en un bar de tapas en Madrid. Es la hora de comer.",
        "School": "You are a helpful primary school teacher discussing subjects with a new student.",
        "Escuela": "Eres un profesor de primaria hablando sobre asignaturas con un alumno nuevo.",
        "Travel": "You are a tourist information guide at a kiosk in Barcelona helping a traveler.",
        "Viajes": "Eres un guía turístico en Barcelona ayudando a un viajero.",
        "Doctor": "You are a general practitioner doctor at a clinic. You are empathetic and professional.",
        "Weather": "You are a neighbor chatting in the elevator about the crazy weather lately.",
        "Tiempo": "Eres un vecino charlando en el ascensor sobre el tiempo loco de estos días."
    };

    console.log(`⚡ Generating GENKIT response for session ${sessionId}...`);
    
    const history = await this.getHistory(sessionId).getMessages();
    // OPTIMIZATION: Limit history to last 4 messages to save tokens (requested by user)
    const historyContext = history.slice(-4).map(m => ({
        role: m._getType() === 'human' ? 'user' : 'model',
        content: [{ text: m.content.toString() }]
    }));

    console.log('📜 GENKIT HISTORY DEBUG:', JSON.stringify(historyContext, null, 2));

    const scenarioDescription = TOPIC_SCENARIOS[topic] || TOPIC_SCENARIOS[topic.charAt(0).toUpperCase() + topic.slice(1)] || `Contexto: Conversación sobre ${topic}.`;

    const inputPayload = {
        history: historyContext,
        message: input,
        topic: scenarioDescription,
        level: level
    };

    // PRIMARY ENGINE: Google Gemini 1.5 Flash (Direct Call)
    console.log("✨ Contacting Gemini 1.5 Flash...");
    
    // No try/catch here - let errors bubble up to server.ts
    const result = await tutorFlowGemini(inputPayload);
    const output = result as Response;

    console.log("♊ Gemini Response:", JSON.stringify(output, null, 2));

    if (!output || !output.text) throw new Error("Empty Response from Gemini");
    
    await this.getHistory(sessionId).addUserMessage(input);
    await this.getHistory(sessionId).addAIMessage(output.text);

    return output;
  }

  async startConversation(sessionId: string, topic: string, level: string) {
    this.messageHistories.set(sessionId, new InMemoryChatMessageHistory());
    
    // Initial Trigger for the AI to introduce itself
    return await this._generateResponse(
      sessionId, 
      "Start conversation. Topic: " + topic, 
      topic, 
      level
    );
  }

  async sendMessage(sessionId: string, message: string, topic: string, level: string) {
    return await this._generateResponse(sessionId, message, topic, level);
  }
}

export default new ConversationService();
