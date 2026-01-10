import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import Flashcard from "../../components/Flashcard";

describe("Flashcard", () => {
  it("renderiza el contenido correctamente", () => {
    render(<Flashcard english="Apple" spanish="Manzana" onLearned={vi.fn()} />);

    // Verifica que se muestra el texto en inglés
    expect(screen.getByText("Apple")).toBeTruthy();
  }); 

  it("marca como aprendida", () => {
    const mockOnLearned = vi.fn();

    render(
      <Flashcard english="Hello" spanish="Hola" onLearned={mockOnLearned} />
    );

    // Buscamos el botón de aprendido (ajusta el selector según tu UI)
    // Si usas un emoji ✅:
    // const learnedButton = screen.getByText("✅");

    // Si no estás seguro del texto, buscamos todos los botones y cogemos el segundo (suponiendo que el 1º es audio)
    const buttons = screen.getAllByRole("button");
    // Ajusta el índice [1] si es necesario
    const learnedButton =
      buttons.find((btn) => btn.textContent?.includes("✅")) ||
      buttons[buttons.length - 1];

    if (learnedButton) {
      fireEvent.click(learnedButton);
      expect(mockOnLearned).toHaveBeenCalled();
    } else {
      // Si no encuentra el botón, fallamos el test con un mensaje útil
      throw new Error("No se encontró el botón de marcar como aprendida");
    }
  });
});
