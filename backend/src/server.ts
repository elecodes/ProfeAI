import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

// IMPORTANT: Load and validate environment variables BEFORE importing anything else
import { env } from "./config/env";

// Now import Services and Routes after env vars are loaded
import TTSService from "./services/TTSService";
import ttsRoutes from "./api/v1/tts.routes";
import chatRoutes from "./api/v1/chat.routes";
import grammarRoutes from "./api/v1/grammar.routes";
import dialogueRoutes from "./api/v1/dialogue.routes";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: express.Application = express();
app.disable("x-powered-by");

// 1. SECURITY MIDDLEWARE
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "blob:", "data:", "https://unpkg.com", "https://*.firebaseapp.com", "https://cdn.tailwindcss.com", "https://*.elevenlabs.io", "https://apis.google.com"],
        scriptSrcElem: ["'self'", "'unsafe-inline'", "blob:", "data:", "https://unpkg.com", "https://*.firebaseapp.com", "https://cdn.tailwindcss.com", "https://*.elevenlabs.io", "https://apis.google.com"],
        workerSrc: ["'self'", "blob:", "data:"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://unpkg.com", "https://elevenlabs.io"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        connectSrc: [
          "'self'",
          "https://identitytoolkit.googleapis.com",
          "https://securetoken.googleapis.com",
          "https://firestore.googleapis.com",
          "https://texttospeech.googleapis.com",
          "https://api.elevenlabs.io",
          "https://api.us.elevenlabs.io",
          "wss://api.elevenlabs.io",
          "wss://api.us.elevenlabs.io",
          "https://*.elevenlabs.io",
          "wss://*.elevenlabs.io",
          "https://elevenlabs.io",
          "https://polly.us-east-1.amazonaws.com",
        ],
        imgSrc: ["'self'", "data:", "blob:", "https://elevenlabs.io", "https://*.elevenlabs.io", "https://storage.googleapis.com", "https://*.googleusercontent.com"],
        mediaSrc: ["'self'", "data:", "blob:"],
        frameSrc: ["'self'", "https://elevenlabs.io", "https://accounts.google.com", "https://*.firebaseapp.com", "https://apptutor-a4230.firebaseapp.com"],
      },
    },
    crossOriginOpenerPolicy: false,
  })
);

// 2. LOGGING MIDDLEWARE - High priority for debugging
app.use((req, res, next) => {
  console.log(`📥 [${req.method}] ${req.path} - ${new Date().toISOString()}`);
  next();
});

// 3. CORS CONFIGURATION - Unified
app.use(cors({
  origin: [
    "http://localhost:5173", 
    "http://127.0.0.1:5173",
    "https://profe-ai-frontend-s2yc.vercel.app",
    "https://profeai.elecodes.online",
    "https://profeai.onrender.com",
    /\.vercel\.app$/ 
  ],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true
}));

// 4. PARSING MIDDLEWARE
app.use(express.json());

// 5. UTILITY ROUTES
app.get("/api/ping", (req, res) => {
  res.json({ status: "ok", message: "Backend is reachable", timestamp: new Date() });
});

// 6. RATE LIMITING
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." }
});

// 7. API ROUTES (V1)
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/grammar", grammarRoutes);
app.use("/api/v1/tts", ttsRoutes);
app.use("/api/v1/generate-dialogue", dialogueRoutes);

// 8. LEGACY COMPATIBILITY ROUTES
app.use("/api/chat", limiter, chatRoutes);
app.use("/api/grammar", limiter, grammarRoutes);
app.use("/api/tts", limiter, ttsRoutes);
app.use("/api/generate-dialogue", limiter, dialogueRoutes);

// 9. ERROR HANDLING / 404 LOGGING
app.use("/api", (req, res) => {
  console.log(`❌ Unmatched API request: [${req.method}] ${req.originalUrl}`);
  res.status(404).json({ 
    error: "API Route not found on backend", 
    method: req.method,
    path: req.originalUrl 
  });
});

app.use("/tts", limiter, ttsRoutes);

// 10. STATIC FILES & SPA
app.use(express.static(path.join(__dirname, "../../frontend/dist")));

app.get(/.*/, (req: express.Request, res: express.Response) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ error: "API Route not found" });
  }
  res.sendFile(path.join(__dirname, "../../frontend/dist", "index.html"));
});

async function startServer() {
  const providerStatus = await TTSService.getProviderStatus();
  console.log("🔊 TTS Provider Status:", providerStatus);

  if (!providerStatus.polly && !providerStatus.elevenlabs && !providerStatus.google) {
    console.warn("⚠️ WARNING: No TTS providers configured! Only Web Speech API will be available.");
  }

  app.listen(env.PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://localhost:${env.PORT}`);
  });
}

startServer().catch(console.error);
