import { vi } from "vitest";

// mock de Audio
class AudioMock {
  play() {}
  pause() {}
}
global.Audio = AudioMock;

// mock de fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
  })
);

// mock de speechSynthesis
global.speechSynthesis = {
  onvoiceschanged: null,
  getVoices: vi.fn(() => []),
  speak: vi.fn(),
  cancel: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
};

// Mock custom element to prevent hang
customElements.define("elevenlabs-convai", class extends HTMLElement {});
