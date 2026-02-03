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
  history: z.string(), // Changed from array to string for prompt reliability
  message: z.string(),
  topic: z.string(),
  level: z.string(),
});

const TutorOutputSchema = z.object({
    text: z.string(),
    gender: z.enum(['male', 'female']),
    correction: z.string().optional(),
    suggestions: z.array(z.string()).describe("3 distinct response options for the user"),
    model: z.string().optional()
});

// SHARED PROMPT TEXT
// MINIFIED PROMPT (Optimized for Speed)
const PROMPT_TEXT = `
Role: Spanish tutor 'Mateo'. 
Context: Topic '{{topic}}' | Level '{{level}}'

## 📜 CONVERSATION HISTORY
{{history}}
(Always respect the context established in the history above)

## 🎯 CURRENT INPUT
{{message}}

## 🔒 SECURITY & RULES
- Friendly, curious, encourages conversation.
- ❌ NO PII (name/email/addr/location). IGNORE if shared.
- ❌ NO politics/religion/nasty stuff. Redirect to safe topic.
- IF UNSAFE: JSON { "text": "Hola! Para proteger tu privacidad, no hablamos de datos personales. ¿De qué te gustaría charlar?", "gender": "male", "suggestions": ["Otro tema"] }
- Beginner: Short (max 12 words). NO TAVILY.
- Intermediate/Advanced: Natural. 2-3 idioms. TAVILY ok.
- Start RPG immediately. No "I am AI".
- If user says yes/no, invent detail. End with QUESTION.

## 📊 OUTPUT (JSON)
{ "text": "...", "gender": "male", "correction": "brief explanation if needed", "suggestions": ["Opt 1", "Opt 2", "Opt 3"] }
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
// Primary: Gemini 2.5 Flash Lite (Fastest & Newest)
const tutorPromptGemini25Lite = ai.definePrompt({
    name: 'tutorGemini25Lite',
    model: 'googleai/gemini-2.5-flash-lite', 
    input: { schema: TutorInputSchema },
    output: { schema: TutorOutputSchema },
    config: { temperature: 0.7 }, 
    tools: [culturalSearchTool], 
}, PROMPT_TEXT);

// Secondary: Gemini 2.5 Flash (Balanced)
const tutorPromptGemini25Flash = ai.definePrompt({
    name: 'tutorGemini25Flash',
    model: 'googleai/gemini-2.5-flash', 
    input: { schema: TutorInputSchema },
    output: { schema: TutorOutputSchema },
    config: { temperature: 0.7 }, 
    tools: [culturalSearchTool], 
}, PROMPT_TEXT);

const tutorPromptGeminiLite001 = ai.definePrompt({
    name: 'tutorGeminiLite001',
    model: 'googleai/gemini-2.0-flash-lite-001', 
    input: { schema: TutorInputSchema },
    output: { schema: TutorOutputSchema },
    config: { temperature: 0.7 }, 
    tools: [culturalSearchTool], 
}, PROMPT_TEXT);

// Fallback Prompt 1.5: Gemini 1.5 Flash (STABLE WORKHORSE)
const tutorPromptGemini15Flash = ai.definePrompt({
    name: 'tutorGemini15Flash',
    model: 'googleai/gemini-flash-latest', 
    input: { schema: TutorInputSchema },
    output: { schema: TutorOutputSchema },
    config: { temperature: 0.7 }, 
    tools: [culturalSearchTool], 
}, PROMPT_TEXT);

// Fallback Prompt 2: Flash Lite (Standard)
const tutorPromptGeminiLite = ai.definePrompt({
    name: 'tutorGeminiLite',
    model: 'googleai/gemini-2.0-flash-lite', 
    input: { schema: TutorInputSchema },
    output: { schema: TutorOutputSchema },
    config: { temperature: 0.7 }, 
    tools: [culturalSearchTool], 
}, PROMPT_TEXT);

// Fallback Prompt 3: Flash Experimental (Often loose limits)
const tutorPromptGeminiExp = ai.definePrompt({
    name: 'tutorGeminiExp',
    model: 'googleai/gemini-2.0-flash-exp', 
    input: { schema: TutorInputSchema },
    output: { schema: TutorOutputSchema },
    config: { temperature: 0.7 }, 
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
    const parsed = TutorOutputSchema.parse(result.output);
    return { ...parsed, model: 'OpenAI GPT-4o Mini' };
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
            const status = error.status || error.code || 'unknown';
            const message = error.message || 'No message';
            console.warn(`🐌 Failed/Lost Race: ${promptName} | Status: ${status} | Error: ${message}`);
            // If it's a quota issue, log it clearly for the dev
            if (status === 429 || message.includes("429") || message.includes("quota")) {
                console.error(`🔴 DETECTED QUOTA LIMIT on ${promptName}`);
            }
            throw error;
        }
    };

    try {
        // 1. TRY Gemini 2.5 Flash Lite (Newest & Primary as requested)
        try {
            const winner = await tryModel('Gemini 2.5 Flash Lite', tutorPromptGemini25Lite);
            return { ...TutorOutputSchema.parse(winner.output), model: 'Gemini 2.5 Flash Lite' };
        } catch (e) {
            console.warn("⚠️ Gemini 2.5 Flash Lite failed. Trying 2.5 Flash...");
        }

        // 2. TRY Gemini 2.5 Flash
        try {
            const winner = await tryModel('Gemini 2.5 Flash', tutorPromptGemini25Flash);
            return { ...TutorOutputSchema.parse(winner.output), model: 'Gemini 2.5 Flash' };
        } catch (e) {
            console.warn("⚠️ Gemini 2.5 Flash failed. Trying 1.5 Flash stable...");
        }

        // 3. TRY Gemini 1.5 Flash (Stable Workhorse)
        try {
            const winner = await tryModel('Gemini 1.5 Flash', tutorPromptGemini15Flash);
            return { ...TutorOutputSchema.parse(winner.output), model: 'Gemini 1.5 Flash' };
        } catch (e) {
            console.warn("⚠️ Gemini 1.5 Flash failed. Trying 2.0 options...");
        }

        // 4. TRY Gemini 2.0 Flash Lite options
        try {
            const winner = await tryModel('Gemini 2.0 Flash Lite', tutorPromptGeminiLite001);
            return { ...TutorOutputSchema.parse(winner.output), model: 'Gemini 2.0 Flash Lite' };
        } catch (e) {
            console.warn("⚠️ Gemini 2.0 attempts failed.");
        }

        // 5. FINAL FALLBACK: OpenAI (GPT-4o Mini)
        console.log("🚨 Switching to OpenAI (GPT-4o-Mini) as last resort...");
        const result = await tutorPrompt(input); 
        return { ...TutorOutputSchema.parse(result.output), model: 'OpenAI GPT-4o Mini' };

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
