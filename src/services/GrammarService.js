import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { env } from "../config/env.js";

// Define the schema for the grammar report
const GrammarReportSchema = z.object({
  score: z.number().min(0).max(100).describe("A score from 0 to 100 based on grammar accuracy"),
  corrections: z.array(z.object({
    original: z.string().describe("The segment of text containing the error"),
    corrected: z.string().describe("The corrected version of the segment"),
    explanation: z.string().describe("Brief explanation of the grammar rule broken"),
    type: z.enum(["grammar", "vocabulary", "spelling", "punctuation"]).describe("Type of error")
  })).describe("List of specific corrections"),
  generalFeedback: z.string().describe("Overall encouraging feedback and tips for improvement")
});

class GrammarService {
  constructor() {
    this.model = new ChatOpenAI({
      openAIApiKey: env.OPENAI_API_KEY,
      modelName: "gpt-4o-mini",
      temperature: 0, // Deterministic for analysis
    });

    // Bind the schema to the model to force structured output
    this.analyzer = this.model.withStructuredOutput(GrammarReportSchema);
  }

  /**
   * Analyzes the provided text for grammatical errors.
   * @param {string} text - The user's text to analyze
   * @param {string} context - Optional context (e.g., "Conversation about ordering coffee")
   * @returns {Promise<object>} - The structured grammar report
   */
  async analyze(text, context = "General conversation") {
    const prompt = `
    Analyze the following Spanish text for grammatical accuracy.
    Context: ${context}
    
    Text to analyze:
    "${text}"
    
    Provide a strict grammatical report. If the text is perfect, return a score of 100 and empty corrections.
    `;

    try {
      const report = await this.analyzer.invoke(prompt);
      return report;
    } catch (error) {
      console.error("Error analyzing grammar:", error);
      // Fallback in case of failure
      return {
        score: 0,
        corrections: [],
        generalFeedback: "Could not analyze grammar at this time."
      };
    }
  }
}

export default new GrammarService();
