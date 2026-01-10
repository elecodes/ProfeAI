import { ChatOpenAI } from "@langchain/openai";
import { InMemoryChatMessageHistory } from "@langchain/core/chat_history";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { env } from "../config/env.js";
import { z } from "zod";

const ResponseSchema = z.object({
  text: z.string(),
  gender: z.enum(["male", "female"]),
  correction: z.string().optional(), // Nueva propiedad para feedback inmediato
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
      maxTokens: 150,
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
    // FORCE FREE MODE / OFFLINE MODE to ensure speed and no cost as requested.
    // The OpenAI code is bypassed.
    console.log(`⚡ Generating LOCAL response for session ${sessionId}...`);
    return this._generateLocalResponse(topic, input, level);
  }

  _generateLocalResponse(topic: string, input: string, level: string): Response {
    const lowerInput = input.toLowerCase().trim();
    const topicLower = topic.toLowerCase();
    
    let text = "";
    let gender: "male" | "female" = "female";
    let correction: string | undefined = undefined;

    // --- HELPER PATTERNS ---
    const isGreeting = /^(hola|buenos|buenas|hi|hello|start)/i.test(lowerInput);
    const isFarewell = /^(adios|chao|bye|gracias|hasta|see you|me voy)/i.test(lowerInput);
    
    // --- GENERIC GRAMMAR CHECKS (Basic Regex Rule Engine) ---
    // 1. "Yo querer" -> "Yo quiero"
    if (/\byo\s+(querer|tener|hacer|comer|estar|ser)\b/i.test(lowerInput)) {
      correction = "Gramática: Los verbos en infinitivo (terminados en -ar, -er, -ir) deben conjugarse. Ejemplo: 'Yo quiero' en lugar de 'Yo querer'.";
    }
    // 2. "Yo gusta" -> "Me gusta"
    else if (/\byo\s+gusta\b/i.test(lowerInput)) {
      correction = "Gramática: Con el verbo 'gustar', decimos 'Me gusta', no 'Yo gusta'.";
    }
    // 3. TENSE MISMATCH: "Ayer" + Present Tense (voy, como, estoy, tengo...)
    else if (/(ayer|anoche|pasada).*\b(voy|como|tengo|estoy|soy|hago|vamos|vienes)\b/i.test(lowerInput)) {
        correction = "Tiempo verbal: Si dices 'ayer', debes usar el pasado. Ejemplo: 'Fui' o 'Estuve' en lugar de 'Voy' o 'Estoy'.";
    }
    // 4. Correction Request: "Está correcta?"
    else if (/(correcta|bien|mal|error).*(frase|oracion|escrito)/i.test(lowerInput)) {
        // If we reached here, no other error was caught, so it might be okay.
        text = "Gramaticalmente parece correcta, pero intenta añadir más detalles para practicar.";
        correction = "Consejo: Si usas palabras de tiempo como 'ayer' o 'mañana', revisa que el verbo coincida.";
        return { text, gender, correction };
    }
    // 5. One word answers (encourage fluency)
    else if (input.split(" ").length < 2 && !isGreeting && !isFarewell && input.length > 0) {
      correction = "Fluidez: Intenta usar frases completas. Ejemplo: 'Quiero agua' en lugar de solo 'Agua'.";
    }
    // 6. English detection (simple check)
    else if (/\b(want|have|is|are|the|my|your)\b/i.test(lowerInput) && !lowerInput.includes("significa")) {
        correction = "Idioma: Intenta decirlo en español. Si no sabes, puedes preguntar '¿Cómo se dice...?'";
    }


    // --- SCENARIO LOGIC ---

    // RESTAURANT (Detects English "Week 1", "Restaurant", "Pedir comida", etc)
    if (topicLower.includes("restaurant") || topicLower.includes("comida") || topicLower.includes("food") || topicLower.includes("pedir") || topicLower.includes("restaurante") || topicLower.includes("cena") || topicLower.includes("almuerzo")) {
        gender = "male"; // Waiter
        
        // OFF-TOPIC CHECK
        if (/\b(football|soccer|fútbol|partido|política|president|presidente|clima|weather|coche|car)\b/i.test(lowerInput)) {
            text = "¡Qué interesante! Pero ahora tengo mucho trabajo en la cocina y hay clientes esperando. ¿Le traigo la carta?";
            correction = "Fuera de contexto: Estamos en un restaurante. Intenta centrarte en pedir comida o bebida.";
            return { text, gender, correction };
        }

        if (isGreeting || input.includes("Start")) {
            text = "¡Bienvenido a 'El Sabor Español'! Me llamo Carlos, su camarero. ¿Mesa para uno o espera a alguien?";
        } else if (lowerInput.includes("mesa") || lowerInput.includes("uno") || lowerInput.includes("dos") || lowerInput.includes("table")) {
            text = "Perfecto, sígame por aquí. Aquí tiene el menú. ¿Le apetece algo de beber mientras elige? Tenemos vino, agua y refrescos.";
        } else if (lowerInput.includes("beber") || lowerInput.includes("drink") || lowerInput.includes("agua") || lowerInput.includes("vino") || lowerInput.includes("cerveza") || lowerInput.includes("refresco") || lowerInput.includes("coca")) {
            text = "¡Excelente elección! Enseguida se lo traigo. ¿Sabe ya qué va a comer de plato principal?";
        } else if (lowerInput.includes("carta") || lowerInput.includes("menu") || lowerInput.includes("recomienda") || lowerInput.includes("what")) {
            text = "Hoy tenemos una paella deliciosa y gazpacho fresco. También recomiendo la tortilla de patatas. ¿Qué le apetece?";
        } else if (lowerInput.includes("paella") || lowerInput.includes("gazpacho") || lowerInput.includes("tortilla") || lowerInput.includes("carne") || lowerInput.includes("pescado") || lowerInput.includes("quiero") || lowerInput.includes("please")) {
            text = "¡Muy buena elección! Tomo nota. ¿Desea algún postre o café?";
        } else if (lowerInput.includes("postre") || lowerInput.includes("cafe") || lowerInput.includes("dessert") || lowerInput.includes("flan") || lowerInput.includes("fruta") || lowerInput.includes("nada") || lowerInput.includes("no")) {
             text = "Marchando. ¿Me pide la cuenta cuando termine?";
        } else if (lowerInput.includes("cuenta") || lowerInput.includes("bill") || lowerInput.includes("pagar")) {
            text = "Aquí tiene la cuenta. Son 25 euros. ¿Prefiere pagar con tarjeta o en efectivo?";
        } else if (lowerInput.includes("tarjeta") || lowerInput.includes("efectivo") || lowerInput.includes("cash") || lowerInput.includes("card")) {
            text = "Muchas gracias. ¡Esperamos verle pronto de nuevo! ¡Adiós!";
        } else {
            // General "catch-all" tailored to restaurant
            text = "¿Desea algo más? ¿Quizás un poco de pan o aceite?";
            if (!correction) correction = "Alternativa: Si no sabes qué decir, puedes preguntar '¿Qué lleva la paella?' o pedir la cuenta.";
        }
    } 
    
    // DOCTOR (Detects "Health", "Doctor", "Salud", etc)
    else if (topicLower.includes("doctor") || topicLower.includes("tutor") || topicLower.includes("médico") || topicLower.includes("health") || topicLower.includes("salud") || topicLower.includes("enfermo")) {
        gender = "female"; // Doctor
        
         // OFF-TOPIC CHECK
        if (/\b(restaurant|food|comida|camarero|waiter|precio|cost|buy|pizza|burger)\b/i.test(lowerInput)) {
             text = "Disculpe, soy doctora, no vendo comida. Céntrese en sus síntomas, por favor.";
             correction = "Fuera de contexto: Estás en el médico. Habla de síntomas o salud.";
             return { text, gender, correction };
        }

        if (isGreeting || input.includes("Start")) {
            text = "Buenos días. Soy la Dra. García. Pase y siéntese, por favor. ¿Cuál es el motivo de su visita hoy?";
        } else if (lowerInput.includes("duele") || lowerInput.includes("pain") || lowerInput.includes("dolor") || lowerInput.includes("mal") || lowerInput.includes("sick") || lowerInput.includes("siento")) {
            text = "Entiendo. ¿Desde cuándo tiene estos síntomas? ¿Es un dolor fuerte?";
        } else if (lowerInput.includes("dias") || lowerInput.includes("ayer") || lowerInput.includes("hoy") || lowerInput.includes("semana") || lowerInput.includes("desde") || lowerInput.includes("since")) {
            text = "Ya veo. ¿Ha tenido fiebre o algún otro síntoma como tos o mareo?";
        } else if (lowerInput.includes("fiebre") || lowerInput.includes("tos") || lowerInput.includes("fever") || lowerInput.includes("cough") || lowerInput.includes("si") || lowerInput.includes("no")) {
            text = "Entendido. Voy a examinarle... (Examina). Parece una infección leve. Le voy a recetar unos antibióticos. ¿Es alérgico a algo?";
        } else if (lowerInput.includes("alergia") || lowerInput.includes("medicamento") || lowerInput.includes("receta") || lowerInput.includes("gracias") || lowerInput.includes("ok")) {
             text = "Muy bien. Tome esta pastilla cada 8 horas. Descanse mucho y beba agua. Si no mejora, vuelva en 3 días.";
        } else if (isFarewell) {
            text = "Cuídese mucho. ¡Que se mejore pronto!";
        } else {
             text = "¿Podría describirme mejor cómo se siente? Necesito más detalles para el diagnóstico.";
             if (!correction) correction = "Ayuda: Puedes decir 'Me duele la cabeza', 'Tengo fiebre', o 'Estoy mareado'.";
        }
    }

    // --- GRAMMAR QUESTION HANDLER (Generic Check for "X o Y?") ---
    // Example: "como o comi?", "voy o fui?", "es o esta?"
    if (/\b(\w+)\s+o\s+(\w+)\??$/i.test(lowerInput)) {
        const match = lowerInput.match(/\b(\w+)\s+o\s+(\w+)\??$/i);
        if (match) {
            const word1 = match[1];
            const word2 = match[2];
            // Simple heuristic for verbs
            text = `Buena pregunta. Normalmente depende del cuándo. '${word1}' suele ser presente o futuro, y '${word2}' puede ser pasado.`;
            if (word1.endsWith('o') && word2.endsWith('i')) {
                 text = `Si hablas de ayer, usa '${word2}' (pasado). Si es ahora o siempre, usa '${word1}' (presente).`;
            }
            correction = "Consejo: Fíjate en el tiempo de la frase. ¿Pasó ayer o está pasando ahora?";
            return { text, gender, correction };
        }
    }

    // SCENARIO: CINEMA / MOVIES (Detects "Cine", "Pelicula", "Movie")
    if (topicLower.includes("cine") || topicLower.includes("pelicula") || topicLower.includes("movie") || topicLower.includes("film") || lowerInput.includes("cine")) {
        gender = "male"; 
        
        if (isGreeting || input.includes("Start")) {
            text = "¡Qué buen tema! Me encanta el cine. ¿Cuál es la última película que has visto?";
        } else if (lowerInput.includes("ayer") || lowerInput.includes("fui") || lowerInput.includes("visto") || lowerInput.includes("vi")) {
            text = "¡Ah, genial! ¿Y te gustó? ¿De qué género era?";
        } else if (lowerInput.includes("voy") && !lowerInput.includes("mañana")) { 
             text = "¿Vas a ir ahora o ya fuiste? Recuerda que si fue ayer, decimos 'fui'.";
             correction = "Tiempo verbal: 'Voy' es presente/futuro. Si ya pasó, usa 'Fui'.";
        } else if (lowerInput.includes("no me gusta") || lowerInput.includes("aburrida") || lowerInput.includes("mala") || lowerInput.includes("horrible")) {
            text = "Vaya, qué pena. ¿Y por qué no te gustó? ¿Era muy larga?";
        } else if (lowerInput.includes("gusto") || lowerInput.includes("buena") || lowerInput.includes("interesante") || lowerInput.includes("si")) {
            text = "Me alegro. A veces las películas nos sorprenden. ¿Comiste palomitas o algo?";
        } else if (lowerInput.includes("palomitas") || lowerInput.includes("popcorn") || lowerInput.includes("soda") || lowerInput.includes("refresco") || lowerInput.includes("comi") || lowerInput.includes("beb")) {
            text = "¡Qué rico! Es la mejor parte del cine. ¿Fuiste solo o con amigos?";
        } else if (lowerInput.includes("amigos") || lowerInput.includes("solo") || lowerInput.includes("familia") || lowerInput.includes("novia") || lowerInput.includes("novio") || lowerInput.includes("con")) {
            text = "Siempre es un buen plan. ¿Y quién era el actor principal?";
        } else if (lowerInput.includes("actor") || lowerInput.includes("actriz") || lowerInput.includes("famoso") || lowerInput.includes("se llama") || lowerInput.length > 3 && /^[A-Z]/.test(input)) {
             // Heuristic: mentions actor/famoso or starts with Capital letter (Name)
             text = "¡Ah, es muy buen actor! ¿Lo has visto en otras películas?";
        } else {
             // RANDOMIZED FALLBACK for Cinema to avoid loops
             const cinemaQuestions = [
                 "¿Y recomendarías esa película a otras personas?",
                 "¿Te gustan más las películas de acción o de comedia?",
                 "¿Sueles ir mucho al cine o prefieres ver películas en casa?",
                 "Cuéntame más sobre la trama, ¿de qué trataba?",
                 "¿Qué es lo que más te gustó de la historia?"
             ];
             text = cinemaQuestions[Math.floor(Math.random() * cinemaQuestions.length)];
        }
    }

    // SCENARIO: SHOPPING / SUPERMARKET (Detects "Super", "Mercado", "Comprar", "Tienda")
    else if (topicLower.includes("super") || topicLower.includes("mercado") || topicLower.includes("market") || topicLower.includes("tienda") || topicLower.includes("shop") || topicLower.includes("comprar") || topicLower.includes("buy")) {
        gender = "male"; // Shopkeeper
        
         // OFF-TOPIC CHECK
        if (/\b(doctor|medico|hospital|enfermo|pain)\b/i.test(lowerInput)) {
             text = "Perdone, esto es una tienda de alimentación. ¿Necesita que llame a una ambulancia?";
             correction = "Fuera de contexto: Estás en un supermercado. Habla de alimentos o compras.";
             return { text, gender, correction };
        }

        if (isGreeting || input.includes("Start")) {
            text = "¡Hola! Bienvenido a 'Supermercados El Sol'. ¿En qué puedo ayudarle hoy?";
        } else if (lowerInput.includes("fruta") || lowerInput.includes("fruit") || lowerInput.includes("manzana") || lowerInput.includes("banana") || lowerInput.includes("naranja")) {
            text = "Las frutas están en el pasillo 1. Hoy tenemos ofertas en manzanas y plátanos. ¿Cuántos kilos necesita?";
        } else if (lowerInput.includes("kilo") || lowerInput.includes("gramo") || lowerInput.includes("bolsa") || lowerInput.includes("caja") || /\d/.test(lowerInput) || lowerInput.includes("unidades")) {
            text = "Perfecto, aquí tiene. ¿Necesita algo más? Tenemos pan recién hecho.";
        } else if (lowerInput.includes("pan") || lowerInput.includes("bread") || lowerInput.includes("leche") || lowerInput.includes("milk") || lowerInput.includes("huevo") || lowerInput.includes("carne") || lowerInput.includes("pollo")) {
             // Randomize to avoid loops
             const responses = [
                 "Excelente elección. ¿Cuántas unidades o kilos necesita?",
                 "Muy bien. ¿Desea algo más? Tenemos ofertas en la sección de frutas.",
                 "¡Qué rico! Justo acaba de llegar fresco. ¿Necesita algo más?",
                 "Tomo nota. ¿Algo más para su cesta?"
             ];
             text = responses[Math.floor(Math.random() * responses.length)];
        } else if (lowerInput.includes("nada mas") || lowerInput.includes("es todo") || lowerInput.includes("fin") || (lowerInput.includes("no") && lowerInput.includes("gracias"))) {
            text = "Estupendo. Serían 25 euros. ¿Va a pagar con tarjeta o efectivo?";
        } else if (lowerInput.includes("tarjeta") || lowerInput.includes("efectivo") || lowerInput.includes("card") || lowerInput.includes("cash")) {
            text = "Gracias. Aquí tiene su recibo. ¡Que tenga un buen día!";
        } else if (lowerInput.includes("buscar") || lowerInput.includes("donde") || lowerInput.includes("tienen") || lowerInput.includes("hay")) {
             text = "Sí, tenemos de todo. ¿Qué producto está buscando exactamente?";
        } else {
             text = "¿Desea comprar algo más? Hoy tenemos descuento en la pescadería.";
        }
    }

    // GENERIC / CUSTOM TOPIC FALLBACK ("Smart Echo")
    else {
        gender = "female";
        if (isGreeting || input.includes("Start")) {
             text = `¡Hola! Vamos a practicar español sobre: "${topic}". ¿Qué te gustaría decir sobre esto?`;
        } else {
             // Smart Echo Logic (ELIZA style) - much better than random
             if (lowerInput.includes("porque") || lowerInput.includes("because")) {
                 text = "Entiendo. ¿Y eso es importante para ti?";
             } else if (lowerInput.includes("gusta") || lowerInput.includes("like")) {
                 text = "¡Qué bien! ¿Y cuál es tu favorito?";
             } else if (lowerInput.includes("no") && lowerInput.length < 10) {
                 text = "¿Por qué no? Explícame un poco más.";
             } else if (lowerInput.includes("si") && lowerInput.length < 5) {
                 text = "Vale. ¿Y qué más?";
             } else if (lowerInput.includes("creo") || lowerInput.includes("think") || lowerInput.includes("opino")) {
                 text = "Es una opinión válida. Continúa, por favor.";
             } else if (lowerInput.includes("practicar") || lowerInput.includes("learn") || lowerInput.includes("aprender")) {
                 text = "¡Genial! Yo te ayudo. ¿Qué frase quieres intentar decir?";
             } else {
                 // Catch-all: Safer, less specific responses
                 const responses = [
                     "Entiendo. Cuéntame más sobre eso.",
                     "Muy interesante. ¿Y qué más?",
                     "Te escucho. Continúa, por favor.",
                     "¿Ah, sí? Explícame más detalles.",
                     "¡Qué bien! Sigue practicando."
                 ];
                 text = responses[Math.floor(Math.random() * responses.length)];
             }
             
             if (lowerInput.length < 5 && !correction) {
                 correction = "Sugerencia: Intenta usar frases más largas para practicar mejor.";
             }
        }
    }

    return { text, gender, correction };
  }

  async startConversation(sessionId: string, topic: string, level: string) {
    this.messageHistories.set(sessionId, new InMemoryChatMessageHistory());
    // For start, we don't add the user instruction to history as a visible message usually,
    // but here we treat it as the initiating system prompt trigger.
    
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

