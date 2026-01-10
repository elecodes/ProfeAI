import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import FlashcardActions from "../../components/FlashcardActions";

describe("FlashcardActions", () => {
  it("renderiza los botones correctamente", () => {
    // Pasamos funciones vacías para que no falle el renderizado
    render(
      <FlashcardActions
        setShowTranslation={vi.fn()}
        setLearned={vi.fn()}
        onLearned={vi.fn()}
      />
    );

    // Verifica que existen botones (ajusta el texto si es diferente en tu UI)
    // Aquí busco botones genéricos, ajusta los textos según lo que veas en pantalla
    expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
  });

  it("toggle de traducción llama al callback setShowTranslation", () => {
    const mockSetShowTranslation = vi.fn();

    render(
      <FlashcardActions
        setShowTranslation={mockSetShowTranslation}
        setLearned={vi.fn()} // Mock necesario para evitar errores si el componente lo usa
        onLearned={vi.fn()}
      />
    );

    // Busca el botón de traducción.
    // NOTA: Si tu botón tiene un icono o texto específico, úsalo aquí.
    // Ejemplo: screen.getByText("👁️") o screen.getByText("Ver Traducción")
    // Si no estás seguro del texto, busca el primer botón:
    const buttons = screen.getAllByRole("button");
    const translationButton = buttons[0]; // Asumiendo que es el primero

    fireEvent.click(translationButton);

    expect(mockSetShowTranslation).toHaveBeenCalled();
  });

  it("botón marcar aprendida llama a setLearned y onLearned", () => {
    const mockSetLearned = vi.fn();
    const mockOnLearned = vi.fn();

    render(
      <FlashcardActions
        setShowTranslation={vi.fn()}
        setLearned={mockSetLearned}
        onLearned={mockOnLearned}
      />
    );

    // Busca el botón de "Aprendida".
    // Asumiendo que es el segundo botón o tiene un texto específico
    const buttons = screen.getAllByRole("button");
    // Ajusta este índice [1] si el botón de 'check' es otro, o usa getByText("✅")
    const learnedButton = buttons[1];

    fireEvent.click(learnedButton);

    expect(mockSetLearned).toHaveBeenCalledWith(true);
    expect(mockOnLearned).toHaveBeenCalled();
  });
});
