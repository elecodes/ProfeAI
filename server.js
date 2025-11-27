import express from "express";
import cors from "cors";

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
import { generateDialogueSchema, ttsSchema } from "./src/schemas/api.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// --- Routes ---

// 1. Chat / Roleplay Endpoints
app.post("/api/chat/start", async (req, res) => {
  try {
    const { topic, level, sessionId } = req.body;
    // Simple validation
    if (!topic || !level || !sessionId) {
      return res.status(400).json({ error: "Missing topic, level, or sessionId" });
    }

    const reply = await ConversationService.startConversation(sessionId, topic, level);
    res.json({ message: reply });
  } catch (error) {
    console.error("Error starting chat:", error);
    res.status(500).json({ error: "Failed to start conversation" });
  }
});

app.post("/api/chat/message", async (req, res) => {
  try {
    const { message, sessionId, topic, level } = req.body;
    if (!message || !sessionId) {
      return res.status(400).json({ error: "Missing message or sessionId" });
    }

    const reply = await ConversationService.sendMessage(sessionId, message, topic, level);
    res.json({ message: reply });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to process message" });
  }
});

// 2. Grammar Analysis Endpoint
app.post("/api/grammar/analyze", async (req, res) => {
  try {
    const { text, context } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Missing text to analyze" });
    }

    const report = await GrammarService.analyze(text, context);
    res.json(report);
  } catch (error) {
    console.error("Error analyzing grammar:", error);
    res.status(500).json({ error: "Failed to analyze grammar" });
  }
});
// Serve static files from the build directory
app.use(express.static(path.join(__dirname, "dist")));

// API: Generate Dialogue
app.post('/api/generate-dialogue', validate(generateDialogueSchema), async (req, res) => {
  try {
    const { topic, level } = req.body;
    // Validation handled by middleware, so topic is guaranteed to exist
    
    console.log(`✨ Generating dialogue: "${topic}" (${level})`);
    const dialogue = await DialogueGenerator.generate(topic, level);
    res.json(dialogue);
  } catch (error) {
    console.error("Generation error:", error);
    res.status(500).json({ error: "Failed to generate dialogue" });
  }
});

app.post("/tts", validate(ttsSchema), async (req, res) => {
  try {
    console.log("📩 /tts request:", req.body);

    const { text, language, options } = req.body;
    // Validation handled by middleware, so text is guaranteed to exist

    // Use TTSService with automatic fallback
    const result = await TTSService.generateSpeech(text, language, options);

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
      suggestion: "Client should use Web Speech API as fallback"
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
    available: status.elevenlabs || status.google || status.webSpeech
  });
});

// Start server and log provider status
async function startServer() {
  // Get provider status (this will trigger initialization)
  const providerStatus = await TTSService.getProviderStatus();
  console.log("🔊 TTS Provider Status:", providerStatus);

  if (!providerStatus.polly && !providerStatus.elevenlabs && !providerStatus.google) {
    console.warn("⚠️ WARNING: No TTS providers configured! Only Web Speech API will be available.");
  }

  app.listen(env.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${env.PORT}`);
  });
}

startServer().catch(console.error);
