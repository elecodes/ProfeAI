import { genkit, z } from 'genkit';
import { openAI, gpt4oMini } from 'genkitx-openai';
import { googleAI } from '@genkit-ai/googleai'; // Import Google AI
import { tavily } from '@tavily/core';
import { env } from '../config/env';

// Initialize Genkit with OpenAI AND Google AI
console.log("🔑 GOOGLE_GENAI_API_KEY Linked:", env.GOOGLE_GENAI_API_KEY ? "YES (Length: " + env.GOOGLE_GENAI_API_KEY.length + ")" : "NO");

const ai = genkit({
  plugins: [
      openAI({ apiKey: env.OPENAI_API_KEY }),
      googleAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY }), // Direct process.env access as requested
  ],
  model: gpt4oMini, // Default model
});

// ... (Tavily Tool Definition remains same) ...
const tvClient = tavily({ apiKey: env.TAVILY_API_KEY || 'tv-placeholder' });
export const culturalSearchTool = ai.defineTool(
  {
    name: 'culturalSearchTool',
    description: 'Use this tool to search for real-time information, cultural facts about Spain/Latam, or news.',
    inputSchema: z.object({ query: z.string() }),
    outputSchema: z.object({ results: z.any() }),
  },
  async ({ query }) => {
    try {
      const response = await tvClient.search(query, {
        search_depth: "basic",
        max_results: 3
      });
      if (!response.results || response.results.length === 0) {
        return { results: "Sin datos adicionales disponibles." };
      }
      return { results: response.results };
    } catch (e) {
      console.error("Tavily Search Error:", e);
      return { results: "Error fetching search results." };
    }
  }
);

// Define Input/Output Schemas
const TutorInputSchema = z.object({
  history: z.array(z.any()),
  message: z.string(),
  topic: z.string(),
  level: z.string(),
});

const TutorOutputSchema = z.object({
    text: z.string(),
    gender: z.enum(['male', 'female']),
    correction: z.string().optional(),
    suggestions: z.array(z.string()).describe("3 distinct response options for the user")
});

// SHARED PROMPT TEXT
// MINIFIED PROMPT (Optimized for Speed)
const PROMPT_TEXT = `
Role: Spanish tutor 'Mateo'. Friendly, curious, encourages conversation.
Context: '{{topic}}' | Level: '{{level}}'

## 🔒 SECURITY (STRICT)
- ❌ NO PII (name/email/addr/location). IGNORE if shared.
- ❌ NO politics/religion/nasty stuff. Redirect to safe topic.
- IF UNSAFE: JSON { "text": "Hola! Para proteger tu privacidad, no hablamos de datos personales. ¿De qué te gustaría charlar?", "gender": "male", "suggestions": ["Otro tema"] }

## 🎯 LEVELS
- Beginner: Short sentences (max 12 words). Basic vocabulary. NO TAVILY. Strict grammar.
- Intermediate: Natural. 2-3 idioms. TAVILY ok for static culture.
- Advanced: Native fluency. TAVILY ok.

## 📝 RULES
1. Start RPG immediately. No "I am AI".
2. If user says yes/no, invent detail. End with QUESTION.

## 📊 OUTPUT (JSON)
{ "text": "...", "gender": "male", "correction": "brief explanation if needed", "suggestions": ["Option 1", "Option 2", "Option 3"] }

History: {{history}}
Input: {{message}}
`;

// ... (Prompts definitions remain the same) ...

// Primary Prompt (OpenAI)
const tutorPrompt = ai.definePrompt({
    name: 'tutor',
    model: gpt4oMini, // Explicit
    input: { schema: TutorInputSchema },
    output: { schema: TutorOutputSchema },
    config: { temperature: 0.7, presencePenalty: 0.6, frequencyPenalty: 0.3 }, 
    tools: [culturalSearchTool], 
}, PROMPT_TEXT);

// Fallback Prompt (Gemini)
// Fallback Prompt 1: Flash Lite 001 (Priority)
const tutorPromptGeminiLite001 = ai.definePrompt({
    name: 'tutorGeminiLite001',
    model: 'googleai/gemini-2.0-flash-lite-001', 
    input: { schema: TutorInputSchema },
    output: { schema: TutorOutputSchema },
    config: { temperature: 0.7, presencePenalty: 0.6, frequencyPenalty: 0.3 }, 
    tools: [culturalSearchTool], 
}, PROMPT_TEXT);

// Fallback Prompt 1.5: Gemini 1.5 Flash (STABLE WORKHORSE)
const tutorPromptGemini15Flash = ai.definePrompt({
    name: 'tutorGemini15Flash',
    model: 'googleai/gemini-flash-latest', 
    input: { schema: TutorInputSchema },
    output: { schema: TutorOutputSchema },
    config: { temperature: 0.7, presencePenalty: 0.6, frequencyPenalty: 0.3 }, 
    tools: [culturalSearchTool], 
}, PROMPT_TEXT);

// Fallback Prompt 2: Flash Lite (Standard)
const tutorPromptGeminiLite = ai.definePrompt({
    name: 'tutorGeminiLite',
    model: 'googleai/gemini-2.0-flash-lite', 
    input: { schema: TutorInputSchema },
    output: { schema: TutorOutputSchema },
    config: { temperature: 0.7, presencePenalty: 0.6, frequencyPenalty: 0.3 }, 
    tools: [culturalSearchTool], 
}, PROMPT_TEXT);

// Fallback Prompt 3: Flash Experimental (Often loose limits)
const tutorPromptGeminiExp = ai.definePrompt({
    name: 'tutorGeminiExp',
    model: 'googleai/gemini-2.0-flash-exp', 
    input: { schema: TutorInputSchema },
    output: { schema: TutorOutputSchema },
    config: { temperature: 0.7, presencePenalty: 0.6, frequencyPenalty: 0.3 }, 
    tools: [culturalSearchTool], 
}, PROMPT_TEXT);

// Fallback Prompt 4: Flash Standard (Last resort, known to have strict limits)
const tutorPromptGeminiFlash = ai.definePrompt({
    name: 'tutorGeminiFlash',
    model: 'googleai/gemini-2.0-flash-001', 
    input: { schema: TutorInputSchema },
    output: { schema: TutorOutputSchema },
    config: { temperature: 0.7, presencePenalty: 0.6, frequencyPenalty: 0.3 }, 
    tools: [culturalSearchTool], 
}, PROMPT_TEXT);


// Primary Flow
/**
 * The main flow for the AI Spanish tutor.
 * Processes user messages and returns a structured response including text, gender, corrections, and suggestions.
 * 
 * Uses a "racing" strategy with multiple Gemini models to ensure high availability and low latency,
 * falling back to OpenAI (GPT-4o Mini) if necessary.
 */
export const tutorFlow = ai.defineFlow(
  {
    name: 'tutorFlow',
    inputSchema: TutorInputSchema,
    outputSchema: TutorOutputSchema,
  },
  async (input) => {
    const result = await tutorPrompt(input);
    return TutorOutputSchema.parse(result.output);
  }
);

// Fallback Flow
export const tutorFlowGemini = ai.defineFlow(
  {
    name: 'tutorFlowGemini',
    inputSchema: TutorInputSchema,
    outputSchema: TutorOutputSchema,
  },
  async (input) => {
    console.log("⚠️ Using GEMINI Fallback Flow with RACING Strategy");

    // Helper for delay
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    // Helper to try a prompt
    const tryModel = async (promptName: string, promptFunc: any) => {
        try {
            console.log(`🚀 Racing model: ${promptName}...`);
            const result = await promptFunc(input);
            console.log(`🏆 WINNER: ${promptName}`);
            return result;
        } catch (error: any) {
            console.warn(`🐌 Failed/Lost Race: ${promptName}: ${error.message}`);
            throw error;
        }
    };

    try {
        // 1. RACE: Flash Lite 001 vs Flash Lite Standard
        // Run both simultaneously, take the first one that succeeds.
        try {
            const winner = await Promise.any([
                tryModel('Flash Lite 001', tutorPromptGeminiLite001),
                tryModel('Flash Lite Standard', tutorPromptGeminiLite)
            ]);
            return TutorOutputSchema.parse(winner.output);
        } catch (raceError) {
            console.warn("⚠️ Both Lite models failed/timed out. Moving to stable fallback.");
        }

        // 2. FALLBACK: Gemini 1.5 Flash (Stable)
        console.log("⚠️ Trying Gemini 1.5 Flash (Robust Fallback)...");
        try { 
             return TutorOutputSchema.parse((await tryModel('Gemini 1.5 Flash', tutorPromptGemini15Flash)).output); 
        } catch (e) { 
             console.log("⚠️ 1.5 Flash failed. Trying Experimental...");
        }

        // 3. LAST RESORT: Experimental
        try { return TutorOutputSchema.parse((await tryModel('Flash Experimental', tutorPromptGeminiExp)).output); } catch (e) { /* No delay */ }
        
        // 4. ABSOLUTE LAST RESORT: Standard (Wait 1s)
        try { 
            await delay(1000);
            return TutorOutputSchema.parse((await tryModel('Flash Standard', tutorPromptGeminiFlash)).output); 
        } catch (e) { }

        // 5. FINAL FALLBACK: OpenAI (GPT-4o Mini)
        console.log("🚨 All Google models exhausted. Switching to OpenAI (GPT-4o-Mini)...");
        const result = await tutorPrompt(input); 
        return TutorOutputSchema.parse(result.output);

    } catch (finalError: any) {
        console.error("🔥 ALL AI Providers (Google + OpenAI) failed.");
        throw finalError;
    }
  }
);
// ... existing code ...
// Local definition to ensure compatibility with Genkit's Zod instance
const DialogueLineSchema = z.object({
  speaker: z.string().describe("Name of the speaker"),
  text: z.string().describe("The text spoken in Spanish"),
  translation: z.string().describe("English translation of the text"),
  gender: z.enum(["male", "female"]).describe("Gender of the speaker for TTS"),
});

const DialogueSchema = z.object({
  title: z.string().describe("The title of the dialogue in Spanish"),
  lines: z.array(DialogueLineSchema).describe("The lines of the dialogue"),
});

const DialogueInputSchema = z.object({
  topic: z.string(),
  level: z.string(),
});

const DIALOGUE_PROMPT_TEXT = `
  Generate a realistic dialogue in Spanish for a student of level "{{level}}".
  Topic: "{{topic}}".
  
  Requirements:
  - The dialogue should have between 4 and 6 lines.
  - Use vocabulary appropriate for the level.
  - Include English translations.
  - Assign a gender ("male" or "female") to each speaker.
  - IMPORTANT: Ensure the speaker's name matches the assigned gender (e.g., Juan = male, Maria = female).
`;

// Define Dialogue Prompt using Gemini 2.0 Flash Lite (Primary)
const dialoguePromptLite = ai.definePrompt({
  name: 'dialogueLite',
  model: 'googleai/gemini-2.0-flash-lite', 
  input: { schema: DialogueInputSchema },
  output: { schema: DialogueSchema },
  config: { temperature: 0.7 },
}, DIALOGUE_PROMPT_TEXT);

// Define Dialogue Prompt using Gemini 1.5 Flash (Fallback)
const dialoguePromptFlash = ai.definePrompt({
  name: 'dialogueFlash',
  model: 'googleai/gemini-flash-latest', 
  input: { schema: DialogueInputSchema },
  output: { schema: DialogueSchema },
  config: { temperature: 0.7 },
}, DIALOGUE_PROMPT_TEXT);

// Export Dialogue Flow with Fallback Strategy
/**
 * A specialized flow for generating educational dialogues.
 * 
 * Implements a fallback strategy:
 * 1. Tries `Gemini 2.0 Flash Lite` (Fast & Cheap).
 * 2. Falls back to `Gemini 1.5 Flash` (Stable).
 */
export const dialogueFlow = ai.defineFlow(
  {
    name: 'dialogueFlow',
    inputSchema: DialogueInputSchema,
    outputSchema: DialogueSchema,
  },
  async (input) => {
    // Helper to attempt generation
    const tryGenerate = async (promptName: string, promptFunc: any) => {
      try {
        console.log(`🚀 Attempting Dialogue Generation with ${promptName}...`);
        const result = await promptFunc(input);
        if (!result.output) throw new Error("Empty output");
        return result.output;
      } catch (e: any) {
        console.warn(`⚠️ ${promptName} failed: ${e.message}`);
        throw e;
      }
    };

    try {
      // 1. Try Lite
      return await tryGenerate('Gemini 2.0 Flash Lite', dialoguePromptLite);
    } catch (e) {
      // 2. Fallback to 1.5 Flash
      console.log("🔄 Switching to Gemini 1.5 Flash fallback...");
      try {
        return await tryGenerate('Gemini 1.5 Flash', dialoguePromptFlash);
      } catch (finalError) {
        console.error("🔥 All Dialogue Generation models failed.");
        throw finalError; // Rethrow to be caught by the service
      }
    }
  }
);
