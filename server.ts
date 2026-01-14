import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import path from "path";
import { fileURLToPath } from "url";

// IMPORTANT: Load and validate environment variables BEFORE importing anything else
import { env } from "./src/config/env.js";

// Now import TTSService after env vars are loaded and validated
import TTSService from "./src/services/TTSService.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import DialogueGenerator from "./src/services/DialogueGenerator.ts";
import ConversationService from "./src/services/ConversationService.ts";
import GrammarService from "./src/services/GrammarService.ts";
import { validate } from "./src/middleware/validate.js";
import {
  generateDialogueSchema,
  ttsSchema,
  grammarAnalysisSchema,
} from "./src/schemas/api.js";

const app: express.Application = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://unpkg.com", "https://cdn.tailwindcss.com"], // React needs unsafe-inline/eval in dev
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://unpkg.com", "https://elevenlabs.io"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        connectSrc: [
          "'self'",
          "https://identitytoolkit.googleapis.com", // Firebase Auth
          "https://securetoken.googleapis.com", // Firebase Auth
          "https://firestore.googleapis.com", // Firestore
          "https://texttospeech.googleapis.com", // Google TTS
          "https://api.elevenlabs.io", // ElevenLabs API
          "https://api.us.elevenlabs.io", // ElevenLabs US API (Fixed CSP)
          "wss://api.elevenlabs.io", // ElevenLabs WebSockets
          "https://elevenlabs.io", // ElevenLabs General
          "https://polly.us-east-1.amazonaws.com", // AWS Polly
        ],
        imgSrc: ["'self'", "data:", "blob:", "https://elevenlabs.io"],
        mediaSrc: ["'self'", "data:", "blob:"],
        frameSrc: ["'self'", "https://elevenlabs.io"],
      },
    },
  })
);
app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"], // Allow Vite dev server
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true
}));
app.use(express.json());

// Rate Limiter: 100 requests per 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { error: "Too many requests, please try again later." }
});

// Apply rate limiting to all API routes
app.use("/api", limiter);

// GLOBAL REQUEST LOGGER
app.use((req, res, next) => {
  console.log(`📥 [${req.method}] ${req.url}`);
  next();
});

// --- Routes ---

// 1. Chat / Roleplay Endpoints
app.post("/api/chat/start", async (req: Request, res: Response) => {
  try {
    const { topic, level, sessionId } = req.body;
    console.log(`📩 Chat Start Request: topic="${topic}", level="${level}", sessionId="${sessionId}"`);
    // Simple validation
    if (!topic || !level || !sessionId) {
      return res
        .status(400)
        .json({ error: "Missing topic, level, or sessionId" });
    }

    const reply = await ConversationService.startConversation(
        sessionId,
        topic,
        level
    );

    // Normalize reply and force male gender safely
    const safeReply =
      typeof reply === "string" ? { text: reply } : reply || { text: "" };
    const finalResponse = { ...safeReply, gender: "male" };

    res.json({ message: finalResponse });
  } catch (error: any) {
    console.error("🔥 ERROR DETALLADO:", error);
    if (error.stack) console.error("Stack:", error.stack);
    if (error.response) {
       console.error("API Error details:", error.response.data);
    }
    
    // Propagate 429 errors
    if (
      error.status === 429 ||
      error.message?.includes("429") ||
      error.message?.includes("Quota exceeded") ||
      error.message?.includes("Rate limit reached") ||
      error.code === "rate_limit_exceeded"
    ) {
      return res
        .status(429)
        .json({ error: "Quota exceeded", code: "rate_limit_exceeded" });
    }

    res.status(500).json({ error: "Failed to start conversation", details: error.message });
  }
});

app.post("/api/chat/message", async (req: Request, res: Response) => {
  try {
    const { message, sessionId, topic, level } = req.body;
    if (!message || !sessionId) {
      return res.status(400).json({ error: "Missing message or sessionId" });
    }

    const reply = await ConversationService.sendMessage(
        sessionId,
        message,
        topic,
        level
    );

    // Normalize reply and force male gender safely
    const safeReply =
      typeof reply === "string" ? { text: reply } : reply || { text: "" };
    const finalResponse = { ...safeReply, gender: "male" };

    res.json({ message: finalResponse });
  } catch (error: any) {
    console.error("Error sending message:", error);

    // Propagate 429 errors
    if (
      error.status === 429 ||
      error.message?.includes("429") ||
      error.message?.includes("Quota exceeded") ||
      error.message?.includes("Rate limit reached") ||
      error.code === "rate_limit_exceeded"
    ) {
      return res
        .status(429)
        .json({ error: "Quota exceeded", code: "rate_limit_exceeded" });
    }

    res.status(500).json({ error: "Failed to process message" });
  }
});

// 2. Grammar Analysis Endpoint
app.post(
  "/api/grammar/analyze",
  validate(grammarAnalysisSchema),
  async (req: Request, res: Response) => {
    try {
      const { text, context } = req.body;
      // Validation handled by middleware

      const report = await GrammarService.analyze(text, context);
      res.json(report);
    } catch (error: any) {
      console.error("Error analyzing grammar:", error);
      res.status(500).json({ error: "Failed to analyze grammar" });
    }
  }
);
// Serve static files from the build directory
app.use(express.static(path.join(__dirname, "dist")));

// API: Generate Dialogue
app.post(
  "/api/generate-dialogue",
  validate(generateDialogueSchema),
  async (req: Request, res: Response) => {
    try {
      const { topic, level } = req.body;
      // Validation handled by middleware, so topic is guaranteed to exist

      console.log(`✨ Generating dialogue: "${topic}" (${level})`);
      const dialogue = await DialogueGenerator.generate(topic, level);

      res.json(dialogue);
    } catch (error: any) {
      console.error("Generation error:", error);
      res.status(500).json({ error: "Failed to generate dialogue" });
    }
  }
);

app.post("/tts", validate(ttsSchema), async (req: Request, res: Response) => {
  try {
    console.log("📩 /tts request:", req.body);

    let { text, language, options } = req.body;
    options = options || {};

    // Ensure male voice is used if requested.
    // We override voiceId to ensure character distinction in dialogues.
    if (options.gender === "male") {
      // Use Web Speech API with Google español voice for best male sound
      options.forceWebSpeech = true;
      options.webSpeechVoiceIndex = 195; // Google español index where user found it works best
      console.log(`👨 Setup male voice: Using Web Speech API with Google español (index 195)`);
    }

    // Validation handled by middleware, so text is guaranteed to exist

    // Use TTSService with automatic fallback
    let result;
    try {
      result = await TTSService.generateSpeech(text, language, options);
    } catch (error: any) {
      console.warn(`⚠️ Primary TTS failed: ${error.message}`);

      // Fallback 1: Try default options (usually works if female works)
      try {
        console.log("🔄 Fallback 1: Trying default voice...");
        result = await TTSService.generateSpeech(text, language, {});
      } catch (err2: any) {
        console.warn(`⚠️ Fallback 1 failed: ${err2.message}`);

        // Fallback 2: Explicitly try the voice that is known to work (Google Standard Female)
        console.log(
          "🔄 Fallback 2: Trying Google Standard Female (Safety Net)..."
        );
        result = await TTSService.generateSpeech(text, language, {
          provider: "google",
          voiceId:
            language && language.startsWith("es")
              ? "es-ES-Standard-A"
              : "en-US-Standard-A",
        });
      }
    }

    // Send audio with provider information in headers
    res.setHeader("Content-Type", result.contentType);
    res.setHeader("X-TTS-Provider", result.provider);
    res.send(Buffer.from(result.audioBuffer));

    console.log(`✅ Audio generated successfully using ${result.provider}`);
  } catch (err: any) {
    console.error("🔴 TTS Error:", err.message);

    // Return error with suggestion to use Web Speech API fallback
    res.status(500).json({
      error: "TTS generation failed",
      message: err.message,
      fallbackAvailable: true,
      suggestion: "Client should use Web Speech API as fallback",
    });
  }
});

// Health check endpoint
app.get("/tts/status", async (req: Request, res: Response) => {
  const status = await TTSService.getProviderStatus();
  res.json({
    providers: status,
    available: status.elevenlabs || status.google || status.webSpeech,
  });
});

// Handle SPA routing - return index.html for any unknown routes
// IMPORTANT: This must be the LAST route defined
app.get(/.*/, (req: Request, res: Response) => {
  // Don't intercept API routes (though they should be matched above)
  if (req.path.startsWith("/tts") || req.path.startsWith("/api")) {
    return res.status(404).json({ error: "Not found" });
  }
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Start server and log provider status
async function startServer() {
  // Get provider status (this will trigger initialization)
  const providerStatus = await TTSService.getProviderStatus();
  console.log("🔊 TTS Provider Status:", providerStatus);

  if (
    !providerStatus.polly &&
    !providerStatus.elevenlabs &&
    !providerStatus.google
  ) {
    console.warn(
      "⚠️ WARNING: No TTS providers configured! Only Web Speech API will be available."
    );
  }

  app.listen(env.PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://localhost:${env.PORT}`);
  });
}

startServer().catch(console.error);
