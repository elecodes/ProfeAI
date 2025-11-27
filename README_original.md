I have fixed the button styles in `src/components/Flashcard.jsx` and created a `.env` file to store your API key securely.

To complete the setup and fix the audio quality, please follow these steps:

1.  **Add your API key to the `.env` file:**
    Open the `.env` file in the root of your project and replace `"YOUR_ELEVENLABS_API_KEY"` with your actual ElevenLabs API key.

2.  **Install the `dotenv` package:**
    Open your terminal and run the following command:
    ```bash
    npm install dotenv
    ```

3.  **Update your `server.js` file:**
    Replace the content of your `server.js` file with the following code. This will configure your server to use the `dotenv` package and the improved `eleven_multilingual_v2` model.

    ```javascript
    import express from "express";
    import fetch from "node-fetch";
    import cors from "cors";
    import dotenv from "dotenv";

    dotenv.config();

    const app = express();
    app.use(cors());
    app.use(express.json());

    const ELEVEN_API_KEY = process.env.ELEVENLABS_API_KEY;
    const ELEVEN_VOICE_EN = "EXAVITQu4vr4xnSDxMaL";
    const ELEVEN_VOICE_ES = "TxGEqnHWrfWFTfGW9XjX";

    app.post("/tts", async (req, res) => {
      try {
        const { text, language } = req.body;
        const voice = language === "es" ? ELEVEN_VOICE_ES : ELEVEN_VOICE_EN;

        if (!ELEVEN_API_KEY || ELEVEN_API_KEY === "YOUR_ELEVENLABS_API_KEY") {
          return res.status(401).json({
            error: "Missing or invalid ElevenLabs API key.",
            details:
              "Please add your API key to the .env file (e.g., ELEVENLABS_API_KEY=your_key_here).",
          });
        }

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
            }),
          }
        );

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
    ```

4.  **Restart your server:**
    After making these changes, restart your server to apply them.

These changes should resolve the audio issues you are experiencing. Let me know if you have any other questions.