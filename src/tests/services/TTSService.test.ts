import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fetch from "node-fetch";
import path from "path";

// Use vi.hoisted to ensure mockFs is initialized before vi.mock calls
const mockFs = vi.hoisted(() => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn(),
}));

vi.mock("fs", () => ({
  default: mockFs,
}));

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

  describe("Caching Logic", () => {
    it("should return cached audio if file exists", async () => {
      // Setup cache hit
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(Buffer.from("cached-audio"));

      const result = await TTSService.generateSpeech("Hello", "en");

      // Should return cached content
      expect(result.provider).toBe("cache");
      expect(result.audioBuffer.toString()).toBe("cached-audio");
      
      // Should NOT call any provider
      expect(fetch).not.toHaveBeenCalled();
    });

    it("should save to cache after generating audio (Cache MISS)", async () => {
      // Setup cache miss
      mockFs.existsSync.mockReturnValue(false);
      
      // Setup successful ElevenLabs generation
      (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () => Promise.resolve(Buffer.from("fresh-audio")),
      });

      const result = await TTSService.generateSpeech("Hello", "en");

      expect(result.provider).toBe("elevenlabs");
      
      // Should write to cache
      expect(mockFs.writeFileSync).toHaveBeenCalled();
      // Inspect arguments to ensure it wrote the correct buffer
      const writeArgs = mockFs.writeFileSync.mock.calls[0];
      expect(writeArgs[1].toString()).toBe("fresh-audio");
    });
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
    // ... other existing tests
  });

  // Keep existing fallback tests but assume cache miss
  describe("generateSpeech (fallback logic)", () => {
    beforeEach(() => {
        mockFs.existsSync.mockReturnValue(false); // Default to cache miss
    });

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
  });
});
