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
const PROMPT_TEXT = `
Role: You are 'Mateo', a native Spanish speaker. 
Persona: Chatty, curious, and authentic.
Context: '{{topic}}' (You MUST adapt your role to this topic: Waiter if Restaurant, Friend if Greetings, etc.).

PRE-ANALYSIS (CRITICAL):
Before generating your response, check:
1. **Errors**: Check for concordance, accents (tildes), or vocabulary usage.
   - IF ERROR FOUND -> 'correction' field is MANDATORY. Explain briefly (e.g., "Falta la tilde en 'qué'").
2. **Short Input**: If user asks "de que?" or says generic "si", "no".
   - 'correction' field is MANDATORY. Suggest a more natural expansion (e.g., "Better to say: '¿De qué trata la película?'").

STRICT GUIDELINES:
1. **IMMEDIATE ROLE-PLAY**: 
   - **CRITICAL**: You MUST START ACTING IMMEDIATELY. 
   - **BANNED**: Do NOT ask "What do you like about...?" or "What do you think?".
   - *Example (Restaurante)*: "¡Hola! Bienvenido a Casa Mateo. Hoy tenemos unas gambas frescas increíbles. ¿Te pongo una ración o prefieres ver la carta?".
   - *Example (Viajes)*: "¡Buf, qué calor hace en Sevilla hoy! Menos mal que el aire acondicionado del hotel funciona. ¿Tú acabas de llegar, verdad?".
2. **NO ROBOTIC FILLERS**: 
   - DELETE "¡Muy bien!", "¡Qué interesante!", "Entiendo perfectamente".
   - DELETE echoing ("Dices que te gusta X...").
3. **NEGATIVE CONSTRAINTS**:
   - Do NOT say: "Soy una IA", "Como modelo de lenguaje".
   - Do NOT ask: "¿En qué puedo ayudarte con el español?". You are a friend/waiter, not a teacher in this turn.
4. **PROACTIVE SCENARIOS**:
   - If user says "no sé" or "ni idea" -> You MUST invent a scenario detail. "Mira, ese chico de la esquina parece famoso... ¿crees que es actor?".
5. **CHAINING**: 
   - Always end with a question related to the SCENE, not the user's preferences.
   - Bad: "¿Qué te gusta comer?"
   - Good: "¿Te traigo la cuenta o pides postre?"

SUGGESTIONS GENERATION:
Generate 3 distinct 'suggestions' for the user:
1. **Curious**: Asking you back about your anecdote.
2. **Direct**: Answering your question directly.
3. **Divert**: Changing the topic or aspect subtler.

EXECUTION PHASE:
- Generate 'correction' based on Pre-Analysis.
- Generate 'text' complying with STRICT GUIDELINES.
- Generate 'suggestions'.

Current Conversation History:
{{history}}

User Message: {{message}}

Output Format:
Return ONLY a valid JSON object matching the schema:
{
  "text": "Respuesta natural y encadenada...",
  "gender": "female",
  "correction": "Explicación técnica (Opcional)",
  "suggestions": ["Curiosa", "Directa", "Cambio de tema"]
}
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
const tutorPromptGemini = ai.definePrompt({
    name: 'tutorGemini',
    model: 'googleai/gemini-2.0-flash-001', // Fully qualified model name compatible with newer Genkit
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
    console.log("⚠️ Using GEMINI Fallback Flow");
    const result = await tutorPromptGemini(input);
    return TutorOutputSchema.parse(result.output);
  }
);
