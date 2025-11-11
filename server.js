// server.js
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta TTS con gTTS (gratuita)
app.post("/tts", async (req, res) => {
  try {
    const { text, language = "en" } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Falta el texto a convertir" });
    }

    const tempFile = path.join(__dirname, "output.mp3");
    const cmd = `gtts-cli "${text.replace(/"/g, '\\"')}" --lang ${language} --output "${tempFile}"`;

    exec(cmd, (error) => {
      if (error) {
        console.error("❌ Error al ejecutar gTTS:", error);
        return res.status(500).json({ error: "Error al generar audio" });
      }

      res.set({
        "Content-Type": "audio/mpeg",
        "Content-Disposition": 'inline; filename="tts.mp3"',
      });

      const fileStream = fs.createReadStream(tempFile);
      fileStream.pipe(res);

      fileStream.on("end", () => {
        fs.unlink(tempFile, () => {}); // borra el archivo temporal
      });
    });
  } catch (error) {
    console.error("❌ Error TTS:", error);
    res.status(500).json({ error: "Error interno del servidor TTS" });
  }
});

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor TTS gratuito en http://localhost:${PORT}`);
});
