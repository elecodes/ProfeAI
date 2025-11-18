import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
console.log("DEBUG API KEY:", process.env.ELEVENLABS_API_KEY);


const app = express();
app.use(cors());
app.use(express.json());

const ELEVEN_API_KEY = process.env.ELEVENLABS_API_KEY;

// Tus voces
const ELEVEN_VOICE_EN = "t5ztDJA7pj9EyW9QIcJ2";
const ELEVEN_VOICE_ES = "f9DFWr0Y8aHd6VNMEdTt";

app.post("/tts", async (req, res) => {
  try {
    const { text, language } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Missing text" });
    }

    const voice = language === "es" ? ELEVEN_VOICE_ES : ELEVEN_VOICE_EN;

    // 🔥 STREAMING = voz más natural + sin corrupción
    const apiRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice}/stream`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVEN_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          // SSML habilitado automáticamente si detecta <speak>
          apply_text_normalization: "disabled",
          voice_settings: {
            stability: 0.35,
            similarity_boost: 0.85,
            style: 0.25,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!apiRes.ok) {
      const err = await apiRes.text();
      console.error("ElevenLabs ERROR:", err);
      return res.status(500).json({ error: "ElevenLabs error", details: err });
    }

    const buffer = await apiRes.arrayBuffer();

    res.setHeader("Content-Type", "audio/mpeg");
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error("SERVER ERROR:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(3001, () => console.log("🚀 TTS server running on port 3001"));
console.log("ELEVEN_API_KEY:", ELEVEN_API_KEY);

