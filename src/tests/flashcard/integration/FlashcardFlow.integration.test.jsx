import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import App from "../../../App";
import { loadLessons } from "../../../../utils/loadLessons";

// Mock loadLessons
vi.mock("../../../../utils/loadLessons", () => ({
  loadLessons: vi.fn(),
}));

// Mock global fetch for TTS
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
  })
);

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = vi.fn(() => "mock-audio-url");
global.URL.revokeObjectURL = vi.fn();

// Mock Audio
global.Audio = vi.fn().mockImplementation(() => ({
  play: vi.fn(),
  pause: vi.fn(),
  onended: null,
}));

describe("Flashcard Integration Flow", () => {
  const mockLessons = [
    {
      weekName: "Semana 1",
      items: [
        { text: "Hola", translation: "Hello" },
        { text: "Gato", translation: "Cat" },
      ],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    loadLessons.mockResolvedValue(mockLessons);
    localStorage.clear();
  });

  it("should load lessons and display the first flashcard", async () => {
    render(<App />);

    // Wait for lessons to load
    await waitFor(() => {
      expect(screen.getByText("Hola")).toBeTruthy();
    });

    // Verify "Ver traducción" button is present
    expect(
      screen.getAllByRole("button", { name: /ver traducción/i })[0]
    ).toBeTruthy();
  });

  it("should reveal translation when 'Ver traducción' is clicked", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Hola")).toBeTruthy();
    });

    const toggleButton = screen.getAllByRole("button", {
      name: /ver traducción/i,
    })[0];
    fireEvent.click(toggleButton);

    expect(screen.getByText("Hello")).toBeTruthy();
    expect(toggleButton.textContent).toMatch(/Ocultar/);
  });

  it("should mark a flashcard as learned and show it in 'Aprendidas' view", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Hola")).toBeTruthy();
    });

    const setItemSpy = vi.spyOn(localStorage, "setItem");

    // Click "Aprendida" for the first card (index 0)
    const learnedButton = screen.getByTestId("learned-btn-0");
    fireEvent.click(learnedButton);

    // Verify localStorage was updated (wait for effect)
    await waitFor(() => {
      expect(setItemSpy).toHaveBeenCalled();
      const stored = JSON.parse(localStorage.getItem("learned"));
      expect(stored).toHaveLength(1);
      expect(stored[0].text).toBe("Hola");
    });

    // Navigate to "Aprendidas" view
    const learnedNavLink = screen.getByRole("button", { name: /✅ aprendidas/i });
    fireEvent.click(learnedNavLink);

    // Verify "Hola" is in the list
    await waitFor(() => {
      expect(screen.getByText("Frases aprendidas")).toBeTruthy();
      expect(screen.getByText("Hola")).toBeTruthy();
    });
  });
});
