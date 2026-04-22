import { Router, Request, Response } from "express";
import TTSService from "../../services/TTSService";
import { validate } from "../../middleware/validate";
import { ttsSchema } from "../../schemas/api";

const router = Router();

// POST /api/v1/tts
router.post("/", validate(ttsSchema), async (req: Request, res: Response) => {
  try {
    console.log("📩 /tts request:", req.body);

    let { text, language, options, uid } = req.body;
    options = options || {};

    // Premium providers are now tried for both male and female voices.
    // If specific providers fail, it falls back to others in TTSService.
    // If Web Speech is forced, return immediately with instructions for the client
    if (options.forceWebSpeech) {
      console.log("⚡ Web Speech API forced. Skipping server-side TTS.");
      res.setHeader("X-TTS-Provider", "web-speech");
      return res.json({
        info: "Web Speech API requested",
        forceWebSpeech: true,
        webSpeechVoiceIndex: options.webSpeechVoiceIndex,
        suggestion: "Client should use Web Speech API",
        provider: "web-speech"
      });
    }

    let result;
    try {
      result = await TTSService.generateSpeech(text, language, options, uid);
    } catch (error: any) {
      console.warn(`⚠️ Primary TTS failed: ${error.message}`);
      try {
        console.log("🔄 Fallback 1: Trying default voice...");
        // CRITICAL: preserve gender so male voices don't fall back to female
        result = await TTSService.generateSpeech(text, language, { gender: options?.gender });
      } catch (err2: any) {
        console.warn(`⚠️ Fallback 1 failed: ${err2.message}`);
        console.log("🔄 Fallback 2: Trying Google Standard Female (Safety Net)...");
        result = await TTSService.generateSpeech(text, language, {
          provider: "google",
          voiceId: language && language.startsWith("es") ? "es-ES-Standard-A" : "en-US-Standard-A",
        });
      }
    }

    res.setHeader("Content-Type", result.contentType);
    res.setHeader("X-TTS-Provider", result.provider);
    res.send(Buffer.from(result.audioBuffer));

    console.log(`✅ Audio generated successfully using ${result.provider}`);
  } catch (err: any) {
    console.error("🔴 TTS Error:", err.message);
    // Instead of 500, we return 200 with a signal for the client to use Web Speech API
    // This prevents "Internal Server Error" alerts and noisy logs.
    res.status(200).json({
      info: "Server-side TTS failed or unavailable",
      forceWebSpeech: true,
      message: err.message,
      suggestion: "Client should use Web Speech API as fallback",
      provider: "web-speech-fallback"
    });
  }
});

// GET /api/v1/tts/status
router.get("/status", async (req: Request, res: Response) => {
  const status = await TTSService.getProviderStatus();
  res.json({
    providers: status,
    available: status.elevenlabs || status.google || status.webSpeech,
  });
});

export default router;
