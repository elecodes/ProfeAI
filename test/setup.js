import { vi } from "vitest";

// mock de Audio
class AudioMock {
  play() {}
  pause() {}
}
globalThis.Audio = AudioMock;

// mock de fetch
globalThis.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
  })
);

// mock de speechSynthesis
Object.defineProperty(globalThis, 'speechSynthesis', {
  value: {
    onvoiceschanged: null,
    getVoices: vi.fn(() => []),
    speak: vi.fn(),
    cancel: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
  },
  writable: true,
  configurable: true // Allow re-definition
});

// Mock custom element to prevent hang
customElements.define("elevenlabs-convai", class extends HTMLElement {});
