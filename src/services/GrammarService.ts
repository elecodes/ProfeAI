import { ChatOpenAI } from "@langchain/openai";
import { env } from "../config/env";
import { GrammarReportSchema, GrammarReport } from "../types/grammar";

class GrammarService {
  private model: ChatOpenAI;
  private analyzer: any; // Using any to avoid type complexity with mismatched LangChain versions

  constructor() {
    // No OpenAI needed for offline mode
    this.model = null as any;
    this.analyzer = null;
  }

  /**
   * Analyzes the text and returns a typed report LOCALLY (Offline Mode)
   */
  async analyze(text: string, context: string = "General conversation"): Promise<GrammarReport> {
    console.log("⚡ Running LOCAL Grammar Analysis...");
    
    // Validation for empty or too short text
    if (!text || text.trim().length < 2) {
      return {
        score: 0,
        corrections: [],
        generalFeedback: "No hay suficiente texto para analizar. Intenta hablar un poco más."
      };
    }

    const corrections: any[] = [];
    let score = 100;
    const lowerText = text.toLowerCase();

    // --- 1. CHECK: Infinitive Verbs ("Yo querer") ---
    // Matches "yo" followed by common infinitives
    const infinitiveRegex = /\byo\s+(querer|tener|hacer|comer|estar|ser|vivir|ir)\b/gi;
    let match;
    while ((match = infinitiveRegex.exec(text)) !== null) {
        corrections.push({
            original: match[0],
            corrected: match[0].replace(/querer/i, "quiero").replace(/tener/i, "tengo").replace(/hacer/i, "hago").replace(/comer/i, "como").replace(/estar/i, "estoy").replace(/ser/i, "soy").replace(/vivir/i, "vivo").replace(/ir/i, "voy"),
            explanation: "Debes conjugar los verbos. 'Yo' se usa con la terminación 'o' generalmente.",
            type: "grammar"
        });
        score -= 15;
    }

    // --- 2. CHECK: Gustar ("Yo gusta") ---
    if (/\byo\s+gusta\b/i.test(text)) {
        corrections.push({
            original: "Yo gusta",
            corrected: "Me gusta",
            explanation: "Con el verbo 'gustar', se usa el pronombre 'Me', no 'Yo'.",
             type: "grammar"
        });
        score -= 15;
    }

    // --- 3. CHECK: Ser/Estar confusion (Basic) ---
    if (/\bsoy\s+(bien|mal|enfermo|en\s+casa)\b/i.test(text)) {
        corrections.push({
            original: "soy " + (text.match(/\bsoy\s+(bien|mal|enfermo|en\s+casa)\b/i)?.[1] || ""),
            corrected: "estoy " + (text.match(/\bsoy\s+(bien|mal|enfermo|en\s+casa)\b/i)?.[1] || ""),
            explanation: "Para estados temporales o ubicación, usamos 'Estar' (estoy), no 'Ser'.",
             type: "grammar"
        });
        score -= 10;
    }

    // --- 4. CHECK: Gender Agreement (Basic - "El casa", "La problema") ---
    if (/\bel\s+casa\b/i.test(text)) corrections.push({ original: "el casa", corrected: "la casa", explanation: "Casa es femenino.", type: "grammar" });
    if (/\bla\s+problema\b/i.test(text)) corrections.push({ original: "la problema", corrected: "el problema", explanation: "Problema es masculino (excepción).", type: "grammar" });
    
    // --- 5. CHECK: Tense Mismatch (Ayer + Present) ---
    const presentVerbs = ["voy", "como", "tengo", "estoy", "soy", "hago", "vamos", "vienes"];
    const tenseRegex = new RegExp(`(ayer|anoche|pasada).*\\b(${presentVerbs.join("|")})\\b`, "i");
    if (tenseRegex.test(text)) {
         corrections.push({
            original: "Ayer... (presente)",
            corrected: "Ayer... (pasado)",
            explanation: "Si hablas del pasado ('ayer'), usa verbos en pasado (fui, comí, tuve...).",
             type: "grammar"
        });
        score -= 20;
    }

    // Cap score at 0
    score = Math.max(0, score);

    // Generate feedback based on score
    let generalFeedback = "";
    if (score === 100) generalFeedback = "¡Excelente! No hemos encontrado errores graves. ¡Sigue así!";
    else if (score >= 80) generalFeedback = "Muy bien. Tienes algunos errores menores, pero te has explicado bien.";
    else if (score >= 50) generalFeedback = "Buen intento. Revisa la conjugación de los verbos y el uso de 'ser/estar'.";
    else generalFeedback = "Sigue practicando. Céntrate en lo básico: Verbos en presente y concordancia.";

    return {
        score,
        corrections,
        generalFeedback
    };
  }
}

export default new GrammarService();
