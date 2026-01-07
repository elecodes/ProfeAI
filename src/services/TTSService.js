import fetch from "node-fetch";
import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";
import { env } from "../config/env.js";

class TTSService {
  constructor() {
    this.elevenLabsKey = null;
    this.googleApiKey = null;
    this.pollyClient = null;
    this.initialized = false;

    // Configuración de voces por género y proveedor
    this.voices = {
      polly: {
        en: {
          female: { Engine: "neural", VoiceId: "Joanna" },
          male: { Engine: "neural", VoiceId: "Matthew" },
        },
        es: {
          female: { Engine: "neural", VoiceId: "Lucia" }, // Natural de España
          male: { Engine: "neural", VoiceId: "Enrique" },
        },
      },
      elevenlabs: {
        en: {
          female: "t5ztDJA7pj9EyW9QIcJ2", // Rachel
          male: "pNInz6obpgDQGcFmaJgB", // Adam
        },
        es: {
          female: "f9DFWr0Y8aHd6VNMEdTt", // Tu voz actual
          male: "N2lVS1wzXKqndCShpkY4", // Josh (Multilingüe/Varonil)
        },
      },
      google: {
        en: {
          female: {
            languageCode: "en-US",
            name: "en-US-Neural2-F",
            ssmlGender: "FEMALE",
          },
          male: {
            languageCode: "en-US",
            name: "en-US-Neural2-D",
            ssmlGender: "MALE",
          },
        },
        es: {
          female: {
            languageCode: "es-ES",
            name: "es-ES-Neural2-A",
            ssmlGender: "FEMALE",
          },
          male: {
            languageCode: "es-ES",
            name: "es-ES-Neural2-B",
            ssmlGender: "MALE",
          },
        },
      },
    };
  }

  async _ensureInitialized() {
    if (this.initialized) return;
    this.initialized = true;

    this.elevenLabsKey = env.ELEVENLABS_API_KEY;
    this.googleApiKey = env.GOOGLE_CLOUD_API_KEY;

    if (env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY) {
      this.pollyClient = new PollyClient({
        region: env.AWS_REGION || "us-east-1",
        credentials: {
          accessKeyId: env.AWS_ACCESS_KEY_ID,
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        },
      });
      console.log("✅ Amazon Polly configured");
    }
  }

  async generateWithElevenLabs(text, language, options = {}) {
    if (!this.elevenLabsKey) throw new Error("ElevenLabs not configured");

    const gender = options.gender || "female";
    const langConfig =
      this.voices.elevenlabs[language] || this.voices.elevenlabs.en;
    const voiceId = langConfig[gender] || langConfig.female;

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": this.elevenLabsKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model_id: "eleven_multilingual_v2",
          text,
          voice_settings: { stability: 0.5, similarity_boost: 0.5 },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.detail?.status === "quota_exceeded")
        throw new Error("QUOTA_EXCEEDED");
      throw new Error(`ElevenLabs error: ${errorData.message || "Unknown"}`);
    }

    return {
      audioBuffer: Buffer.from(await response.arrayBuffer()),
      provider: "elevenlabs",
      contentType: "audio/mpeg",
    };
  }

  async generateWithPolly(text, language, options = {}) {
    if (!this.pollyClient) throw new Error("Polly not configured");

    const gender = options.gender || "female";
    const langConfig = this.voices.polly[language] || this.voices.polly.en;
    const voiceConfig = langConfig[gender] || langConfig.female;

    const command = new SynthesizeSpeechCommand({
      Text: text,
      OutputFormat: "mp3",
      VoiceId: voiceConfig.VoiceId,
      Engine: voiceConfig.Engine,
      LanguageCode: language === "es" ? "es-ES" : "en-US", // Corrección de acento
    });

    const response = await this.pollyClient.send(command);
    const byteArray = await response.AudioStream.transformToByteArray();

    return {
      audioBuffer: Buffer.from(byteArray),
      provider: "polly",
      contentType: "audio/mpeg",
    };
  }

  async generateWithGoogle(text, language, options = {}) {
    if (!this.googleApiKey) throw new Error("Google TTS not configured");

    const gender = options.gender || "female";
    const langConfig = this.voices.google[language] || this.voices.google.en;
    const voiceConfig = langConfig[gender] || langConfig.female;

    const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${this.googleApiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: { text },
        voice: voiceConfig,
        audioConfig: { audioEncoding: "MP3" },
      }),
    });

    const data = await response.json();
    return {
      audioBuffer: Buffer.from(data.audioContent, "base64"),
      provider: "google",
      contentType: "audio/mpeg",
    };
  }

  /**
   * MÉTODO PRINCIPAL CON CASCADA (FALLBACK)
   */
  async generateSpeech(text, language = "es", options = {}) {
    await this._ensureInitialized();
    const errors = [];

    // 1. ElevenLabs (Si hay créditos)
    if (this.elevenLabsKey) {
      try {
        console.log(`🎙️ TTS: ElevenLabs (${options.gender || "female"})...`);
        return await this.generateWithElevenLabs(text, language, options);
      } catch (error) {
        console.warn("⚠️ ElevenLabs falló:", error.message);
        errors.push({ provider: "elevenlabs", error: error.message });
      }
    }

    // 2. Amazon Polly (Económico y natural)
    if (this.pollyClient) {
      try {
        console.log(`🎙️ TTS: Amazon Polly (${options.gender || "female"})...`);
        return await this.generateWithPolly(text, language, options);
      } catch (error) {
        console.warn("⚠️ Polly falló:", error.message);
        errors.push({ provider: "polly", error: error.message });
      }
    }

    // 3. Google Cloud
    if (this.googleApiKey) {
      try {
        console.log(`🎙️ TTS: Google Cloud (${options.gender || "female"})...`);
        return await this.generateWithGoogle(text, language, options);
      } catch (error) {
        console.warn("⚠️ Google falló:", error.message);
        errors.push({ provider: "google", error: error.message });
      }
    }

    throw new Error(
      `Todos los proveedores fallaron: ${JSON.stringify(errors)}`
    );
  }

  async getProviderStatus() {
    await this._ensureInitialized();
    return {
      polly: !!this.pollyClient,
      elevenlabs: !!this.elevenLabsKey,
      google: !!this.googleApiKey,
      webSpeech: true,
    };
  }
}

export default new TTSService();
