import { tutorFlowGemini } from "../lib/genkit";
import { z } from "zod";
import { adminDb } from "../lib/firebase-admin";

const ResponseSchema = z.object({
  text: z.string(),
  gender: z.enum(["male", "female"]),
  correction: z.string().optional(),
  suggestions: z.array(z.string()).optional(),
  model: z.string().optional(),
});

type Response = z.infer<typeof ResponseSchema>;

/**
 * Singleton service that manages chat sessions, history, and AI interaction.
 * Persists history to Firestore to remember users across sessions.
 */
class ConversationService {
  private lastRateLimitTimestamp: number = 0;
  private readonly CIRCUIT_BREAKER_DURATION = 5 * 60 * 1000; // 5 minutes
  
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

  /**
   * Fetches or creates a chat history in Firestore.
   */
  async getHistory(uid: string, sessionId: string) {
    const docRef = adminDb.collection("users").doc(uid).collection("sessions").doc(sessionId);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return { messages: [] };
    }
    
    return doc.data() as { messages: any[] };
  }

  async saveMessage(uid: string, sessionId: string, role: "user" | "model", text: string) {
    const docRef = adminDb.collection("users").doc(uid).collection("sessions").doc(sessionId);
    const history = await this.getHistory(uid, sessionId);
    
    const newMessages = [
        ...history.messages,
        { role, content: [{ text }], timestamp: new Date().toISOString() }
    ];

    // Truncate to last 10 messages to keep context efficient and save tokens
    const truncatedHistory = newMessages.slice(-10);

    await docRef.set({ 
        messages: truncatedHistory,
        lastUpdated: new Date().toISOString()
    }, { merge: true });
  }

  private checkCorrections(message: string): { text: string; correction?: string } | null {
    const msg = message.toLowerCase();
    
    for (const [english, spanish] of Object.entries(this.vocabularyMap)) {
        if (msg.includes(english)) {
            return {
                text: `He notado que usaste "${english}". En español decimos **"${spanish}"**. ¿Puedes intentar la frase de nuevo?`,
                correction: `Usa "${spanish}" en lugar de "${english}".`
            };
        }
    }

    if (msg.match(/\byo\s+\w+(ar|er|ir)\b/i)) {
        if (msg.includes("yo saber")) return { text: "Casi. Para 'I know', decimos **'Yo sé'**. Inténtalo otra vez.", correction: "Yo sé" };
        if (msg.includes("yo tener")) return { text: "Recuerda: 'I have' es **'Yo tengo'**. ¡Prueba de nuevo!", correction: "Yo tengo" };
        if (msg.includes("yo querer")) return { text: "Para decir 'I want', usa **'Yo quiero'**. ¿Cómo quedaría la frase?", correction: "Yo quiero" };
        if (msg.includes("yo poder")) return { text: "Decimos **'Yo puedo'**. ¡Tú puedes hacerlo!", correction: "Yo puedo" };
        return { text: "Parece que usaste el verbo en infinitivo. Recuerda conjugarlo (ej. yo como, yo hablo).", correction: "Conjuga el verbo" };
    }

    if (msg.includes("no querer")) return { text: "Mejor di: **'No quiero'**.", correction: "No quiero" };
    if (msg.includes("no poder")) return { text: "La forma correcta es: **'No puedo'**.", correction: "No puedo" };

    return null;
  }

  async _generateResponse(uid: string, sessionId: string, input: string, topic: string, level: string): Promise<Response> {
    if (Date.now() - this.lastRateLimitTimestamp < this.CIRCUIT_BREAKER_DURATION) {
        throw new Error("El sistema está descansando un momento. Inténtalo de nuevo en unos segundos.");
    }

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

    console.log(`⚡ Generating Response for UID: ${uid}, Session: ${sessionId}...`);
    
    const historyData = await this.getHistory(uid, sessionId);
    const historyContext = historyData.messages.map(m => ({
        role: m.role,
        content: m.content
    }));

    // Fetch user profile for personalization
    const userDoc = await adminDb.collection("users").doc(uid).get();
    const userData = userDoc.exists ? userDoc.data() : null;
    const userName = userData?.displayName || "Estudiante";

    const scenarioDescription = TOPIC_SCENARIOS[topic] || `Contexto: Conversación sobre ${topic}.`;
    
    // Inject user context into the scenario
    const personalizedScenario = `${scenarioDescription} The user's name is ${userName}. Their current level is ${level}. Adapt your complexity accordingly.`;

    const inputPayload = {
        history: historyContext,
        message: input,
        topic: personalizedScenario,
        level: level
    };

    const result = await tutorFlowGemini(inputPayload);
    const output = result as Response;

    if (!output || !output.text) throw new Error("Empty Response from Gemini");
    
    // Save both messages to Firestore
    await this.saveMessage(uid, sessionId, "user", input);
    await this.saveMessage(uid, sessionId, "model", output.text);

    return output;
  }

  async startConversation(uid: string, sessionId: string, topic: string, level: string) {
    // Clear/Reset session in Firestore for start
    await adminDb.collection("users").doc(uid).collection("sessions").doc(sessionId).delete();
    
    return await this._generateResponse(
      uid,
      sessionId, 
      "Start conversation. Topic: " + topic, 
      topic, 
      level
    );
  }

  async sendMessage(uid: string, sessionId: string, message: string, topic: string, level: string) {
    const correction = this.checkCorrections(message);
    if (correction) {
        await this.saveMessage(uid, sessionId, "user", message);
        await this.saveMessage(uid, sessionId, "model", correction.text);
        return {
            text: correction.text,
            gender: "female",
            correction: correction.correction
        } as Response;
    }

    return await this._generateResponse(uid, sessionId, message, topic, level);
  }
}

export default new ConversationService();
