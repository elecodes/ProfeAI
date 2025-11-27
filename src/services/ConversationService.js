import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { InMemoryChatMessageHistory } from "@langchain/core/chat_history";
import { env } from "../config/env.js";

class ConversationService {
  constructor() {
    this.model = new ChatOpenAI({
      openAIApiKey: env.OPENAI_API_KEY,
      modelName: "gpt-4o-mini", // Cost-effective and fast
      temperature: 0.7,
    });

    // Store message histories by session ID
    this.messageHistories = new Map();
  }

  // Helper to get history for a session
  getHistory(sessionId) {
    if (!this.messageHistories.has(sessionId)) {
      this.messageHistories.set(sessionId, new InMemoryChatMessageHistory());
    }
    return this.messageHistories.get(sessionId);
  }

  /**
   * Starts a new conversation or resets an existing one.
   * @param {string} sessionId - Unique session ID
   * @param {string} topic - Conversation topic (e.g., "At the Restaurant")
   * @param {string} level - User level (e.g., "Intermediate")
   */
  async startConversation(sessionId, topic, level) {
    // Reset history for this session
    this.messageHistories.set(sessionId, new InMemoryChatMessageHistory());

    // Define the persona and instructions
    const systemTemplate = `You are a helpful language tutor roleplaying a scenario.
    
    SCENARIO: {topic}
    USER LEVEL: {level}
    
    INSTRUCTIONS:
    1. Act as a character appropriate for the scenario (e.g., waiter for restaurant).
    2. Keep your responses concise (1-2 sentences) to encourage conversation.
    3. Adjust your vocabulary to match the user's level ({level}).
    4. If the user makes a mistake, DO NOT correct them immediately. Just continue the flow naturally.
    5. Start the conversation by greeting the user in character.
    
    Language: Spanish (Target) but you can understand English if the user is stuck.`;

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", systemTemplate],
      new MessagesPlaceholder("history"),
      ["human", "{input}"],
    ]);

    // Create the chain with history
    this.chain = new RunnableWithMessageHistory({
      runnable: prompt.pipe(this.model),
      getMessageHistory: (sessionId) => this.getHistory(sessionId),
      inputMessagesKey: "input",
      historyMessagesKey: "history",
    });

    // Generate the initial greeting (empty input to trigger system prompt context)
    // We simulate a "start" signal or just ask the AI to start.
    // Actually, usually we wait for user input, but for roleplay, AI often starts.
    // Let's invoke it with a hidden instruction to start.
    const response = await this.chain.invoke(
      {
        topic,
        level,
        input: "(System: Start the conversation now as your character)",
      },
      { configurable: { sessionId } }
    );

    return response.content;
  }

  /**
   * Sends a user message and gets the AI response.
   * @param {string} sessionId 
   * @param {string} message 
   * @param {string} topic - Needed for the prompt template context
   * @param {string} level - Needed for the prompt template context
   */
  async sendMessage(sessionId, message, topic, level) {
    if (!this.chain) {
      throw new Error("Conversation not initialized. Call startConversation first.");
    }

    const response = await this.chain.invoke(
      {
        topic,
        level,
        input: message,
      },
      { configurable: { sessionId } }
    );

    return response.content;
  }
}

export default new ConversationService();
