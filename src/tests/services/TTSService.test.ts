import { describe, it, expect, vi, beforeEach } from "vitest";
import fetch from "node-fetch";

// Set environment variables FIRST before importing anything
process.env.ELEVENLABS_API_KEY = "test-elevenlabs-key";
process.env.GOOGLE_CLOUD_API_KEY = "test-google-key";
process.env.AWS_ACCESS_KEY_ID = "test-aws-key";
process.env.AWS_SECRET_ACCESS_KEY = "test-aws-secret";
process.env.AWS_REGION = "us-east-1";

vi.mock("node-fetch", () => ({
  __esModule: true,
  default: vi.fn(),
}));

// Mock AWS Polly
const mockPollyClient = {
  send: vi.fn().mockResolvedValue({
    AudioStream: {
      transformToByteArray: vi
        .fn()
        .mockResolvedValue(Buffer.from("mock-polly-audio")),
    },
  }),
};

vi.mock("@aws-sdk/client-polly", () => {
  return {
    PollyClient: vi.fn(function () {
      return mockPollyClient;
    }),
    SynthesizeSpeechCommand: vi.fn(),
  };
});

// Mock Google Cloud TTS
vi.mock("@google-cloud/text-to-speech", () => ({
  default: {
    TextToSpeechClient: vi.fn().mockImplementation(() => ({
      synthesizeSpeech: vi.fn().mockResolvedValue([
        {
          audioContent: Buffer.from("mock-google-audio"),
        },
      ]),
    })),
  },
}));

// NOW import TTSService after all mocks are set up
import TTSService from "../../services/TTSService";

describe("TTSService", () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
    // Re-initialize the singleton state before each test for isolation
    (TTSService as any).initialized = false;
    await (TTSService as any)._ensureInitialized();
  });

  describe("generateWithElevenLabs", () => {
    it("genera audio exitosamente con ElevenLabs", async () => {
      const mockArrayBuffer = new ArrayBuffer(8);

      (fetch as unknown as ReturnType<typeof vi.fn>).mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          arrayBuffer: () => Promise.resolve(mockArrayBuffer),
        })
      );

      const result = await (TTSService as any).generateWithElevenLabs("Hello", "en");

      expect(result.provider).toBe("elevenlabs");
      expect(result.contentType).toBe("audio/mpeg");
      expect(result.audioBuffer).toEqual(Buffer.from(mockArrayBuffer));
    });

    it("lanza error cuando falta la API key", async () => {
      // This test should throw before fetch is called.
      // Add a defensive mock to ensure fetch is not the cause of the failure.
      (fetch as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => {
        throw new Error("FETCH SHOULD NOT BE CALLED IN THIS TEST");
      });

      const originalKey = (TTSService as any).elevenLabsKey;
      (TTSService as any).elevenLabsKey = null;

      await expect(
        (TTSService as any).generateWithElevenLabs("Hello", "en")
      ).rejects.toThrow("ElevenLabs not configured");

      (TTSService as any).elevenLabsKey = originalKey;
    });

    it("detecta error de cuota excedida", async () => {
      (fetch as unknown as ReturnType<typeof vi.fn>).mockImplementationOnce(() =>
        Promise.resolve({
          ok: false,
          json: () =>
            Promise.resolve({
              detail: {
                status: "quota_exceeded",
                message: "Quota exceeded",
              },
            }),
        })
      );

      await expect(
        (TTSService as any).generateWithElevenLabs("Hello", "en")
      ).rejects.toThrow("QUOTA_EXCEEDED");
    });
  });

  describe("generateSpeech (fallback logic)", () => {
    it("intenta ElevenLabs primero cuando está disponible", async () => {
      // Mock a successful ElevenLabs response
      (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
      });

      const result = await TTSService.generateSpeech("Hello", "en");

      expect(result.provider).toBe("elevenlabs");
      expect(result.contentType).toBe("audio/mpeg");
    });

    it("hace fallback a Polly cuando ElevenLabs falla", async () => {
      // Simular que ElevenLabs falla
      (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: "Something went wrong" }),
      });

      // Polly should be used as fallback
      const result = await TTSService.generateSpeech("Hello", "en");

      expect(result.provider).toBe("polly");
    });

    it("lanza error cuando todos los proveedores fallan", async () => {
      // This test should never call fetch.
      (fetch as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => {
        throw new Error("FETCH SHOULD NOT BE CALLED IN THIS TEST");
      });

      // Simular que todos los proveedores fallan
      const originalPolly = (TTSService as any).pollyClient;
      const originalElevenLabs = (TTSService as any).elevenLabsKey;
      const originalGoogle = (TTSService as any).googleApiKey;

      (TTSService as any).pollyClient = null;
      (TTSService as any).elevenLabsKey = null;
      (TTSService as any).googleApiKey = null;

      await expect(TTSService.generateSpeech("Hello", "en")).rejects.toThrow(
        /Todos los proveedores fallaron/
      );

      (TTSService as any).pollyClient = originalPolly;
      (TTSService as any).elevenLabsKey = originalElevenLabs;
      (TTSService as any).googleApiKey = originalGoogle;
    });
  });

  describe("getProviderStatus", () => {
    it("retorna el estado de los proveedores", async () => {
      const status = await TTSService.getProviderStatus();

      expect(status).toHaveProperty("polly");
      expect(status).toHaveProperty("elevenlabs");
      expect(status).toHaveProperty("google");
      expect(status).toHaveProperty("webSpeech");
      expect(status.webSpeech).toBe(true);
      expect(status.polly).toBe(true);
    });
  });
});
