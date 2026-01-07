import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import DialogueViewer from "../../components/DialogueViewer";

// Mock useTTS
const mockSpeak = vi.fn();
vi.mock("../../components/hooks/useTTS", () => ({
  useTTS: () => ({
    speak: mockSpeak,
  }),
}));

describe("DialogueViewer", () => {
  const mockDialogue = {
    title: "Test Dialogue",
    lines: [
      { speaker: "Person A", text: "Hello", translation: "Hola" },
      { speaker: "Person B", text: "Hi", translation: "Hola" },
    ],
  };

  it("renders the dialogue title and lines", () => {
    render(<DialogueViewer dialogue={mockDialogue} />);
    expect(screen.getByText("Test Dialogue")).toBeTruthy();
    expect(screen.getByText("Hello")).toBeTruthy();
    expect(screen.getByText("Hi")).toBeTruthy();
  });

  it("calls speak when the audio button is clicked", () => {
    render(<DialogueViewer dialogue={mockDialogue} />);
    const audioButtons = screen.getAllByTitle("Escuchar");
    fireEvent.click(audioButtons[0]);
    expect(mockSpeak).toHaveBeenCalledWith("Hello", "es", { gender: undefined });
  });

  it("toggles translation visibility", () => {
    render(<DialogueViewer dialogue={mockDialogue} />);
    
    // Translation should be hidden initially
    expect(screen.queryByText("Hola")).toBeNull();

    // Click "Ver traducción"
    const toggleBtn = screen.getAllByText("Ver traducción")[0];
    fireEvent.click(toggleBtn);

    // Translation should be visible
    expect(screen.getAllByText("Hola")[0]).toBeTruthy();
    expect(toggleBtn.textContent).toBe("Ocultar traducción");
  });
});
