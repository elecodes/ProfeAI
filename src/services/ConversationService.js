import { ChatOpenAI } from "@langchain/openai";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { InMemoryChatMessageHistory } from "@langchain/core/chat_history";
import { z } from "zod"; // Importante para la estructura
import { env } from "../config/env.js";

// Definimos la estructura de la respuesta
const responseSchema = z.object({
  text: z.string().describe("The response text in Spanish"),
  gender: z
    .enum(["male", "female"])
    .describe("The gender of the character speaking"),
});

class ConversationService {
  constructor() {
    this.model = new ChatOpenAI({
      openAIApiKey: env.OPENAI_API_KEY,
      modelName: "gpt-4o-mini",
      temperature: 0.7,
    });

    // Vinculamos el modelo a la salida estructurada
    this.structuredModel = this.model.withStructuredOutput(responseSchema);
    this.messageHistories = new Map();
  }

  getHistory(sessionId) {
    if (!this.messageHistories.has(sessionId)) {
      this.messageHistories.set(sessionId, new InMemoryChatMessageHistory());
    }
    return this.messageHistories.get(sessionId);
  }

  async startConversation(sessionId, topic, level) {
    this.messageHistories.set(sessionId, new InMemoryChatMessageHistory());

    const systemTemplate = `You are a language tutor roleplaying a scenario.
    SCENARIO: {topic}
    USER LEVEL: {level}
    
    INSTRUCTIONS:
    1. Act as a character appropriate for the scenario.
    2. Respond in Spanish.
    3. Keep responses concise (1-2 sentences).
    4. You MUST assign yourself a gender ("male" or "female") based on your character.
    
    Example: If you are a waiter named Juan, your gender is "male".`;

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", systemTemplate],
      new MessagesPlaceholder("history"),
      ["human", "{input}"],
    ]);

    // Usamos el structuredModel aquí
    this.chain = new RunnableWithMessageHistory({
      runnable: prompt.pipe(this.structuredModel),
      getMessageHistory: (sessionId) => this.getHistory(sessionId),
      inputMessagesKey: "input",
      historyMessagesKey: "history",
    });

    return await this.chain.invoke(
      { topic, level, input: "Start the conversation and introduce yourself." },
      { configurable: { sessionId } }
    );
  }

  async sendMessage(sessionId, message, topic, level) {
    if (!this.chain) throw new Error("Conversation not initialized.");

    // Esto devolverá directamente { text: "...", gender: "..." }
    return await this.chain.invoke(
      { topic, level, input: message },
      { configurable: { sessionId } }
    );
  }
}

export default new ConversationService();
