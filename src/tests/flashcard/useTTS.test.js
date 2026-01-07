import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useTTS } from "../../components/hooks/useTTS";

// Mock global para evitar errores de Audio y URL en JSDOM
global.URL.createObjectURL = vi.fn(() => "mock-url");
global.URL.revokeObjectURL = vi.fn();
global.Blob = vi.fn().mockImplementation((parts, options) => ({
  parts,
  options,
  size: 0,
  type: options?.type || "",
}));
global.Audio = vi.fn().mockImplementation(() => ({
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn(),
  onended: null,
  src: "",
}));
// Mock Web Speech API con callbacks que se ejecutan automáticamente
let mockUtterance = null;

global.SpeechSynthesisUtterance = vi.fn(function (text) {
  mockUtterance = {
    text,
    lang: "es-ES",
    rate: 0.9,
    pitch: 1.0,
    volume: 1.0,
    onend: null,
    onerror: null,
  };
  return mockUtterance;
});

global.speechSynthesis = {
  speak: vi.fn((utterance) => {
    // Simular que el speech termina exitosamente después de un breve delay
    setTimeout(() => {
      if (utterance.onend) {
        utterance.onend();
      }
    }, 0);
  }),
  cancel: vi.fn(),
  getVoices: vi.fn(() => []),
};

describe("useTTS", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUtterance = null;
  });

  it("devuelve una función speak y currentProvider", () => {
    const { result } = renderHook(() => useTTS());
    expect(typeof result.current.speak).toBe("function");
    expect(result.current.currentProvider).toBe(null);
  });

  it("usa backend TTS cuando está disponible", async () => {
    const mockFetch = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      headers: {
        get: (key) => (key === "X-TTS-Provider" ? "elevenlabs" : null),
      },
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
    });

    const { result } = renderHook(() => useTTS());

    await result.current.speak("Hello");

    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:3001/tts",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ text: "Hello", language: "es", options: {} }),
      })
    );

    mockFetch.mockRestore();
  });

  it("hace fallback a Web Speech API cuando el backend falla", async () => {
    const mockFetch = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "Backend failed" }),
    });

    const { result } = renderHook(() => useTTS());

    await result.current.speak("Hello");

    // Verificar que se intentó usar el backend
    expect(mockFetch).toHaveBeenCalled();

    // Verificar que se usó Web Speech API como fallback
    await waitFor(
      () => {
        expect(global.speechSynthesis.speak).toHaveBeenCalled();
      },
      { timeout: 1000 }
    );

    mockFetch.mockRestore();
  });

  it("hace fallback a Web Speech API cuando el servidor no está disponible", async () => {
    const mockFetch = vi
      .spyOn(global, "fetch")
      .mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useTTS());

    await result.current.speak("Hello");

    // Verificar que se usó Web Speech API
    await waitFor(
      () => {
        expect(global.speechSynthesis.speak).toHaveBeenCalled();
      },
      { timeout: 1000 }
    );

    mockFetch.mockRestore();
  });

  it("actualiza currentProvider según el proveedor usado", async () => {
    // Mock de fetch mejorado
    const mockFetch = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      // La clave es que 'headers.get' devuelva el valor correcto
      headers: {
        get: vi.fn((key) => {
          if (key.toLowerCase() === "x-tts-provider") return "google";
          return null;
        }),
      },
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
    });

    const { result } = renderHook(() => useTTS());

    // Ejecutamos el habla
    await result.current.speak("Hello");

    // Esperamos la actualización del estado
    await waitFor(
      () => {
        // Si sigue fallando y da 'webspeech', es que 'ok' fue false o el header falló
        expect(result.current.currentProvider).toBe("google");
      },
      { timeout: 2000 }
    );

    mockFetch.mockRestore();
  });

  it("detiene el audio actual antes de reproducir uno nuevo", async () => {
    const mockAudio = {
      play: vi.fn(),
      pause: vi.fn(),
      onended: null,
    };

    window.currentAudio = mockAudio;

    const mockFetch = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      headers: {
        get: () => "elevenlabs",
      },
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
    });

    const { result } = renderHook(() => useTTS());

    await result.current.speak("New text");

    expect(mockAudio.pause).toHaveBeenCalled();

    mockFetch.mockRestore();
  });
});
