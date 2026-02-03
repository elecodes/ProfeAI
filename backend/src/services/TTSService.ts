import fs from "fs";
import path from "path";
import crypto from "crypto";
import fetch from "node-fetch";
import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";
import { env } from "../config/env";
import { TTSOptions, TTSResult, TTSProvider } from "../types/tts";

/** Configuration structure for Gender-based voices. */
interface VoiceConfig {
  female: any;
  male: any;
}

/** Voice configuration per language. */
interface ProviderVoiceConfig {
  en: VoiceConfig;
  es: VoiceConfig;
}

/**
 * Service to handle Text-to-Speech (TTS) operations.
 * Supports multiple providers: ElevenLabs, Amazon Polly, Google Cloud, and Web Speech API (client-side fallback).
 * Uses local filesystem caching to reduce API costs.
 */
class TTSService {
  private elevenLabsKey: string | null = null;
  private googleApiKey: string | null = null;
  private pollyClient: PollyClient | null = null;
  private initialized: boolean = false;
  private voices: Record<string, ProviderVoiceConfig>;
  private cacheDir: string;

  constructor() {
    this.cacheDir = path.join(process.cwd(), "cache", "tts");
    if (!fs.existsSync(this.cacheDir)) {
      try {
        fs.mkdirSync(this.cacheDir, { recursive: true });
      } catch (err) {
        console.warn("⚠️ Could not create TTS cache directory:", err);
      }
    }

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

  private async _ensureInitialized(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;

    this.elevenLabsKey = env.ELEVENLABS_API_KEY || null;
    this.googleApiKey = env.GOOGLE_CLOUD_API_KEY || null;

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

  private _getCacheFilePath(text: string, language: string, options: TTSOptions): string {
    // Determine a safe cache key by including relevant parameters
    // We should probably normalize text (trim) but let's keep it exact for now
    const dataDetails = JSON.stringify({ 
      text, 
      language, 
      // Include gender in cache key so male/female variations are cached separately
      gender: options.gender || 'female',
      // Include provider if specified, though usually we want best available
      provider: options.provider
    });
    
    const hash = crypto.createHash("md5").update(dataDetails).digest("hex");
    return path.join(this.cacheDir, `${hash}.mp3`);
  }

  private async generateWithElevenLabs(text: string, language: string, options: TTSOptions = {}): Promise<TTSResult> {
    if (!this.elevenLabsKey) throw new Error("ElevenLabs not configured");

    const gender = options.gender || "female";
    // @ts-ignore - Dynamic access to voices config
    const langConfig = this.voices.elevenlabs[language] || this.voices.elevenlabs.en;
    const voiceId = langConfig[gender] || langConfig.female;
    
    console.log(`Using ElevenLabs Voice ID: ${voiceId} (${gender})`);
    
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
      const errorData: any = await response.json();
      if (errorData.detail?.status === "quota_exceeded")
        throw new Error("QUOTA_EXCEEDED");
      throw new Error(`ElevenLabs error: ${errorData.message || "Unknown"}`);
    }

    return {
      audioBuffer: Buffer.from(await response.arrayBuffer()),
      provider: "elevenlabs" as TTSProvider,
      contentType: "audio/mpeg",
    };
  }

  private async generateWithPolly(text: string, language: string, options: TTSOptions = {}): Promise<TTSResult> {
    if (!this.pollyClient) throw new Error("Polly not configured");

    const gender = options.gender || "female";
    // @ts-ignore
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
    if (!response.AudioStream) {
        throw new Error("Polly did not return an audio stream");
    }
    const byteArray = await response.AudioStream.transformToByteArray();

    return {
      audioBuffer: Buffer.from(byteArray),
      provider: "polly" as TTSProvider,
      contentType: "audio/mpeg",
    };
  }

  private async generateWithGoogle(text: string, language: string, options: TTSOptions = {}): Promise<TTSResult> {
    if (!this.googleApiKey) throw new Error("Google TTS not configured");

    const gender = options.gender || "female";
    // @ts-ignore
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

    const data: any = await response.json();
    if (!data.audioContent) {
        throw new Error("Google TTS did not return audioContent");
    }
    return {
      audioBuffer: Buffer.from(data.audioContent, "base64"),
      provider: "google" as TTSProvider,
      contentType: "audio/mpeg",
    };
  }

  /**
   * Generates speech from text using a cascade of available providers.
   * 
   * Priority:
   * 1. Cache (Local filesystem)
   * 2. ElevenLabs (High quality, expensive) - Requires API Key
   * 3. Amazon Polly (Good quality, cheaper) - Requires AWS Credentials
   * 4. Google Cloud (Standard quality) - Requires API Key
   * 
   * @param text - The text to synthesize.
   * @param language - Target language code ('es', 'en').
   * @param options - Additional options like gender or specific provider force.
   * @returns Promise resolving to audio buffer and metadata.
   */
  async generateSpeech(text: string, language: string = "es", options: TTSOptions = {}): Promise<TTSResult> {
    await this._ensureInitialized();

    // 0. Check Cache
    const cacheFile = this._getCacheFilePath(text, language, options);
    if (fs.existsSync(cacheFile)) {
      try {
        console.log(`💾 Cache HIT: ${cacheFile}`);
        const audioBuffer = fs.readFileSync(cacheFile);
        return {
          audioBuffer,
          provider: "cache" as any, // "cache" provider
          contentType: "audio/mpeg",
        };
      } catch (err) {
        console.warn("⚠️ Error reading cache:", err);
      }
    } else {
        console.log(`❌ Cache MISS: ${cacheFile}`);
    }

    const errors: {provider: string, error: string}[] = [];
    let result: TTSResult | null = null;

    // 1. ElevenLabs (Si hay créditos) - SOLO SE INTENTA SI HAY KEY
    if (this.elevenLabsKey && !result) {
      try {
        console.log(`🎙️ TTS: ElevenLabs (${options.gender || "female"})...`);
        result = await this.generateWithElevenLabs(text, language, options);
      } catch (error: any) {
        console.warn("⚠️ ElevenLabs falló:", error.message);
        errors.push({ provider: "elevenlabs", error: error.message });
      }
    }

    // 2. Amazon Polly (Económico y natural)
    if (this.pollyClient && !result) {
      try {
        console.log(`🎙️ TTS: Amazon Polly (${options.gender || "female"})...`);
        result = await this.generateWithPolly(text, language, options);
      } catch (error: any) {
        console.warn("⚠️ Polly falló:", error.message);
        errors.push({ provider: "polly", error: error.message });
      }
    }

    // 3. Google Cloud
    if (this.googleApiKey && !result) {
      try {
        console.log(`🎙️ TTS: Google Cloud (${options.gender || "female"})...`);
        result = await this.generateWithGoogle(text, language, options);
      } catch (error: any) {
        console.warn("⚠️ Google falló:", error.message);
        errors.push({ provider: "google", error: error.message });
      }
    }

    if (result) {
        // Save to cache
        try {
            fs.writeFileSync(cacheFile, result.audioBuffer);
            console.log(`💾 Saved to cache: ${cacheFile}`);
        } catch (err) {
            console.warn("⚠️ Could not write to cache:", err);
        }
        return result;
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
