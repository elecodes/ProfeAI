import express from "express";
import cors from "cors";
import helmet from "helmet";

import path from "path";
import { fileURLToPath } from "url";

// IMPORTANT: Load and validate environment variables BEFORE importing anything else
import { env } from "./src/config/env.js";

// Now import TTSService after env vars are loaded and validated
import TTSService from "./src/services/TTSService.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import DialogueGenerator from "./src/services/DialogueGenerator.js";
import ConversationService from "./src/services/ConversationService.js";
import GrammarService from "./src/services/GrammarService.js";
import { validate } from "./src/middleware/validate.js";
import {
  generateDialogueSchema,
  ttsSchema,
  grammarAnalysisSchema,
} from "./src/schemas/api.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // React needs unsafe-inline/eval in dev
        connectSrc: [
          "'self'",
          "https://identitytoolkit.googleapis.com", // Firebase Auth
          "https://securetoken.googleapis.com", // Firebase Auth
          "https://firestore.googleapis.com", // Firestore
          "https://texttospeech.googleapis.com", // Google TTS
          "https://api.elevenlabs.io", // ElevenLabs
          "https://polly.us-east-1.amazonaws.com", // AWS Polly (adjust region if needed)
        ],
        imgSrc: ["'self'", "data:", "blob:"],
        mediaSrc: ["'self'", "data:", "blob:"],
        frameSrc: ["'self'"],
      },
    },
  })
);
app.use(cors());
app.use(express.json());

// --- Routes ---

// 1. Chat / Roleplay Endpoints
app.post("/api/chat/start", async (req, res) => {
  try {
    const { topic, level, sessionId } = req.body;
    // Simple validation
    if (!topic || !level || !sessionId) {
      return res
        .status(400)
        .json({ error: "Missing topic, level, or sessionId" });
    }

    let reply;
    try {
      reply = await ConversationService.startConversation(
        sessionId,
        topic,
        level
      );
    } catch (serviceError) {
      console.error("ConversationService error:", serviceError);
      reply = "Lo siento, hubo un problema al iniciar la conversación.";
    }

    // Normalize reply and force male gender safely
    const safeReply =
      typeof reply === "string" ? { text: reply } : reply || { text: "" };
    const finalResponse = { ...safeReply, gender: "male" };

    res.json({ message: finalResponse });
  } catch (error) {
    console.error("Error starting chat:", error);
    if (error.response) {
       console.error("OpenAI API Error details:", error.response.data);
    }
    res.status(500).json({ error: "Failed to start conversation" });
  }
});

app.post("/api/chat/message", async (req, res) => {
  try {
    const { message, sessionId, topic, level } = req.body;
    if (!message || !sessionId) {
      return res.status(400).json({ error: "Missing message or sessionId" });
    }

    let reply;
    try {
      reply = await ConversationService.sendMessage(
        sessionId,
        message,
        topic,
        level
      );
    } catch (serviceError) {
      console.error("ConversationService error:", serviceError);
      reply = "Lo siento, hubo un problema al procesar tu mensaje.";
    }

    // Normalize reply and force male gender safely
    const safeReply =
      typeof reply === "string" ? { text: reply } : reply || { text: "" };
    const finalResponse = { ...safeReply, gender: "male" };

    res.json({ message: finalResponse });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to process message" });
  }
});

// 2. Grammar Analysis Endpoint
app.post(
  "/api/grammar/analyze",
  validate(grammarAnalysisSchema),
  async (req, res) => {
    try {
      const { text, context } = req.body;
      // Validation handled by middleware

      const report = await GrammarService.analyze(text, context);
      res.json(report);
    } catch (error) {
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
  async (req, res) => {
    try {
      const { topic, level } = req.body;
      // Validation handled by middleware, so topic is guaranteed to exist

      console.log(`✨ Generating dialogue: "${topic}" (${level})`);
      const dialogue = await DialogueGenerator.generate(topic, level);

      // Assign genders to speakers to ensure voice variety
      if (
        dialogue &&
        dialogue.conversation &&
        Array.isArray(dialogue.conversation)
      ) {
        // Filter valid speakers to avoid crashes if AI returns null/undefined
        const speakers = [
          ...new Set(
            dialogue.conversation
              .map((t) => t.speaker)
              .filter((s) => typeof s === "string")
          ),
        ];
        const speakerGenders = {};

        speakers.forEach((speaker) => {
          // Detect gender based on name heuristic
          // Clean name: remove parens, trim to avoid issues with "Maria (Cliente)"
          const name = speaker
            .toLowerCase()
            .replace(/[\(\[].*?[\)\]]/g, "")
            .trim();
          // Ends in 'a' -> Female (Ana, Maria), Others -> Male (Juan, Carlos)
          const isFemale =
            name.endsWith("a") ||
            ["carmen", "isabel", "raquel", "beatriz"].includes(name);

          speakerGenders[speaker] = isFemale ? "female" : "male";
        });

        dialogue.conversation = dialogue.conversation.map((turn) => ({
          ...turn,
          gender:
            turn.speaker && speakerGenders[turn.speaker]
              ? speakerGenders[turn.speaker]
              : "female",
        }));
        console.log("👥 Detected genders:", speakerGenders);
      }

      res.json(dialogue);
    } catch (error) {
      console.error("Generation error:", error);
      res.status(500).json({ error: "Failed to generate dialogue" });
    }
  }
);

app.post("/tts", validate(ttsSchema), async (req, res) => {
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
    } catch (error) {
      console.warn(`⚠️ Primary TTS failed: ${error.message}`);

      // Fallback 1: Try default options (usually works if female works)
      try {
        console.log("🔄 Fallback 1: Trying default voice...");
        result = await TTSService.generateSpeech(text, language, {});
      } catch (err2) {
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
  } catch (err) {
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

// Handle SPA routing - return index.html for any unknown routes
app.get("*", (req, res) => {
  // Don't intercept API routes (though they should be matched above)
  if (req.path.startsWith("/tts") || req.path.startsWith("/api")) {
    return res.status(404).json({ error: "Not found" });
  }
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Health check endpoint
app.get("/tts/status", async (req, res) => {
  const status = await TTSService.getProviderStatus();
  res.json({
    providers: status,
    available: status.elevenlabs || status.google || status.webSpeech,
  });
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

  app.listen(env.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${env.PORT}`);
  });
}

startServer().catch(console.error);
