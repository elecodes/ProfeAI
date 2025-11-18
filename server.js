import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const ELEVEN_API_KEY = process.env.ELEVENLABS_API_KEY;

const ELEVEN_VOICE_EN = "t5ztDJA7pj9EyW9QIcJ2";
const ELEVEN_VOICE_ES = "f9DFWr0Y8aHd6VNMEdTt";

if (!ELEVEN_API_KEY) {
  console.error("❌ ERROR: ELEVENLABS_API_KEY is missing in .env");
} else {
  console.log("✔️ API Key loaded correctly");
}

app.post("/tts", async (req, res) => {
  try {
    console.log("📩 /tts request:", req.body);

    const { text, language } = req.body;
    const voice = language === "es" ? ELEVEN_VOICE_ES : ELEVEN_VOICE_EN;

    const apiRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVEN_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model_id: "eleven_multilingual_v2",
          text,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      }
    );

    if (!apiRes.ok) {
      const errTxt = await apiRes.text();
      console.error("🔴 ElevenLabs ERROR:", errTxt);
      return res
        .status(500)
        .json({ error: "ElevenLabs error", details: errTxt });
    }

    const audioBuffer = await apiRes.arrayBuffer();
    res.setHeader("Content-Type", "audio/mpeg");
    res.send(Buffer.from(audioBuffer));
  } catch (err) {
    console.error("Server ERROR:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(3001, () => {
  console.log("🚀 Server running on http://localhost:3001");
});
