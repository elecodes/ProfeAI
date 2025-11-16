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

app.post("/tts", async (req, res) => {
  try {
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

    // 🔍 Si ElevenLabs devolvió error → NO generar audio corrupto
    if (!apiRes.ok) {
      const errTxt = await apiRes.text();
      console.error("ElevenLabs ERROR:", errTxt);
      return res
        .status(500)
        .json({ error: "Error de ElevenLabs", details: errTxt });
    }

    const audioBuffer = await apiRes.arrayBuffer();
    const contentType = apiRes.headers.get("content-type");

    res.setHeader("Content-Type", contentType);
    res.send(Buffer.from(audioBuffer));
  } catch (err) {
    console.error("Server ERROR:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.listen(3001, () => console.log("🚀 Servidor TTS en puerto 3001"));
