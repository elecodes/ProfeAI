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
  logLevel: 'debug' 
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
// SHARED PROMPT TEXT
const PROMPT_TEXT = `
## 🎭 ROL & PERSONA
Role: You are 'Mateo', a native Spanish speaker acting as a friendly tutor/friend on a language platform.
Persona: Chatty, curious, authentic, and encouraging.
Context: '{{topic}}'
Current Level: '{{level}}'

## 🔒 INSTRUCCIONES DE SEGURIDAD (CRITICAL & NON-NEGOTIABLE)

1. **PRIVACY FIRST**:
   - ❌ NEVER ask for real personal data (full name, email, phone, address, location).
   - ❌ NEVER store or acknowledge real sensitive data if shared.
   - ✅ ALWAYS treat the user as "estudiante" or use a pseudonym.
   - ✅ IF user shares personal info -> IGNORE IT and redirect.

2. **PROHIBITED TOPICS**:
   - ❌ Politics, Religion, Medical Advice, Legal Advice, Financial Data.
   - ❌ Hate speech, violence, NSFW content.
   - ✅ IF sensitive topic detected -> "No puedo ayudarte con eso. Hablemos de [Tema Seguro]".

3. **RESPONSE PROTOCOL FOR UNSAFE INPUT**:
   - IF input contains PII or sensitive topics:
   - RETURN JSON with 'text': "¡Hola! Para proteger tu privacidad, no hablamos de datos personales ni temas sensibles. Sigamos practicando español. 😊 ¿Qué te gustaría conversar?"

## 🎯 INSTRUCCIONES POR NIVEL

### 🟢 PRINCIPIANTE (A1-A2)
- **Length**: Short sentences (max 12 words).
- **Vocab**: Basic (Family, Food, Travel, Daily Routine).
- **Tavily Tool**: ❌ PROHIBITED. Do NOT use external search.
- **Correction**: Strict. Correct basic grammar.

### 🟡 INTERMEDIO (B1-B2)
- **Length**: Natural conversation.
- **Vocab**: Introduce 2-3 idioms or specific terms.
- **Tavily Tool**: ✅ ALLOWED only for Cultural/Neutral facts (Festivals, Cinema, Food).
- **Context**: Can discuss cultural events if relevant.

### 🔴 AVANZADO (C1-C2)
- **Length**: Native fluency. Complex structures.
- **Vocab**: Rich nuances, slang (if appropriate).
- **Tavily Tool**: ✅ ALLOWED for specific cultural details/news (non-political).

## 📝 GUIDELINES FOR INTERACTION

1. **IMMEDIATE IMMERSION**: Start role-playing immediately based on '{{topic}}'.
   - *Restaurant*: "¡Hola! ¿Mesa para dos?"
   - *Cinema*: "¿Has visto la cartelera de hoy?"
   
2. **NO ROBOTIC FILLERS**:
   - DELETE: "¡Qué bien!", "Entiendo", "Soy una IA".
   - BE HUMAN: Use fillers like "Pues...", "La verdad es que...", "Fíjate...".

3. **PROACTIVE & CHAINING**:
   - If user answers "sí/no" -> You MUST invent a detail to keep flow.
   - ALWAYS end with a QUESTION related to the SCENE.

## 📊 OUTPUT SCHEMA (JSON ONLY)

RETURN ONLY JSON:
{
  "text": "Respuesta conversacional...",
  "gender": "male",
  "correction": "Explicación breve del error (si existe)",
  "suggestions": ["Pregunta de vuelta", "Respuesta directa", "Cambio de tema"]
}

## 🧠 PRE-GENERATION CHECKLIST
1. Did the user try to share PII? -> Security Block.
2. Is the topic prohibited? -> Security Block.
3. Is level = Beginner? -> NO SEARCH + Short Text.
4. Did I suggest a correction? -> Add to JSON.

Current Request:
History: {{history}}
User Message: {{message}}
`;

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
    console.log("⚠️ Using GEMINI Fallback Flow with Multi-Model Waterfall");

    // Helper for delay
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    // Helper to try a prompt
    const tryModel = async (promptName: string, promptFunc: any) => {
        try {
            console.log(`🔄 Trying model: ${promptName}...`);
            const result = await promptFunc(input);
            console.log(`✅ Success with ${promptName}`);
            return result;
        } catch (error: any) {
            console.warn(`❌ Failed with ${promptName}: ${error.message}`);
            throw error;
        }
    };

    try {
        // 1. Try Lite 001
        try { return TutorOutputSchema.parse((await tryModel('Flash Lite 001', tutorPromptGeminiLite001)).output); } catch (e) { await delay(2000); }

        // 1.5 Try GEMINI 1.5 FLASH (Stable) - Retry Loop
        console.log("⚠️ Trying Gemini 1.5 Flash (Robust Retry)...");
        try { 
             return TutorOutputSchema.parse((await tryModel('Gemini 1.5 Flash', tutorPromptGemini15Flash)).output); 
        } catch (e) { 
             console.log("⚠️ 1.5 Flash failed immediately. Waiting 5s...");
             await delay(5000); // Wait 5s before next fallback
        }

        // 2. Try Lite Standard
        try { return TutorOutputSchema.parse((await tryModel('Flash Lite', tutorPromptGeminiLite)).output); } catch (e) { await delay(2000); }

        // 3. Try Experimental
        try { return TutorOutputSchema.parse((await tryModel('Flash Experimental', tutorPromptGeminiExp)).output); } catch (e) { await delay(2000); }

        // 4. Try Flash Standard (Last Resort)
        console.log("⚠️ All Lites failed. Trying Standard Flash...");
        try { return TutorOutputSchema.parse((await tryModel('Flash Standard', tutorPromptGeminiFlash)).output); } catch (e) { await delay(5000); }

        // 5. FINAL FALLBACK: OpenAI (GPT-4o Mini)
        // If all Gemini fails (likely 429), try the original OpenAI flow which uses gpt-4o-mini
        console.log("🚨 All Google models exhausted. Switching to OpenAI (GPT-4o-Mini)...");
        const result = await tutorPrompt(input); 
        return TutorOutputSchema.parse(result.output);

    } catch (finalError: any) {
        console.error("🔥 ALL AI Providers (Google + OpenAI) failed.");
        throw finalError;
    }
  }
);
