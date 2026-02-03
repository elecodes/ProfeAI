import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import FlashcardAudioButtons from "../../components/FlashcardAudioButtons";

describe("FlashcardAudioButtons", () => {
  it("renderiza los dos botones de audio", () => {
    // Mock de la función speak (no necesitamos que haga nada, solo que exista)
    const mockSpeak = vi.fn();

    render(
      <FlashcardAudioButtons english="Hello" spanish="Hola" speak={mockSpeak} />
    );

    // Verificamos que los botones existen por su contenido de texto
    expect(screen.getByText("🇺🇸")).toBeTruthy();
    expect(screen.getByText("🇪🇸")).toBeTruthy();
  });

  it("llama a speak con inglés al hacer clic en el botón de USA", () => {
    const mockSpeak = vi.fn();
    const englishText = "Apple";

    render(
      <FlashcardAudioButtons
        english={englishText}
        spanish="Manzana"
        speak={mockSpeak}
      />
    );

    // Simulamos el clic
    const buttonUS = screen.getByText("🇺🇸");
    fireEvent.click(buttonUS);

    // Verificamos que speak se llamó con los argumentos correctos
    expect(mockSpeak).toHaveBeenCalledTimes(1);
    expect(mockSpeak).toHaveBeenCalledWith(englishText, "en");
  });

  it("llama a speak con español al hacer clic en el botón de ES", () => {
    const mockSpeak = vi.fn();
    const spanishText = "Manzana";

    render(
      <FlashcardAudioButtons
        english="Apple"
        spanish={spanishText}
        speak={mockSpeak}
      />
    );

    // Simulamos el clic
    const buttonES = screen.getByText("🇪🇸");
    fireEvent.click(buttonES);

    // Verificamos argumentos
    expect(mockSpeak).toHaveBeenCalledTimes(1);
    expect(mockSpeak).toHaveBeenCalledWith(spanishText, "es");
  });
});
