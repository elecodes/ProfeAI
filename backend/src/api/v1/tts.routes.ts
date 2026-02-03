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

    if (options.gender === "male") {
      options.forceWebSpeech = true;
      options.webSpeechVoiceIndex = 195;
      console.log(`👨 Setup male voice: Using Web Speech API with Google español (index 195)`);
    }

    let result;
    try {
      result = await TTSService.generateSpeech(text, language, options, uid);
    } catch (error: any) {
      console.warn(`⚠️ Primary TTS failed: ${error.message}`);
      try {
        console.log("🔄 Fallback 1: Trying default voice...");
        result = await TTSService.generateSpeech(text, language, {});
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
    res.status(500).json({
      error: "TTS generation failed",
      message: err.message,
      fallbackAvailable: true,
      suggestion: "Client should use Web Speech API as fallback",
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
