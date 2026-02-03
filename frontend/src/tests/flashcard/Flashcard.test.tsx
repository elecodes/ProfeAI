import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import { Flashcard } from "../../components/Flashcard";

describe("Flashcard", () => {
  it("renderiza el contenido correctamente", () => {
    // text = English (Native), translation = Spanish (Target)
    render(
      <Flashcard 
        text="Apple" 
        translation="Manzana" 
        onMarkLearned={vi.fn()} 
        onSpeak={vi.fn()}
      />
    );

    // Initial view shows translation (Manzana)
    expect(screen.getByText("Manzana")).toBeTruthy();
    
    // Check if toggle button exists
    const toggleBtn = screen.getByText(/Mostrar Inglés/i);
    expect(toggleBtn).toBeTruthy();

    // Reveal English
    fireEvent.click(toggleBtn);
    expect(screen.getByText("Apple")).toBeTruthy();
  }); 

  it("marca como aprendida", () => {
    const mockOnLearned = vi.fn();

    render(
      <Flashcard 
        text="Hello" 
        translation="Hola" 
        onMarkLearned={mockOnLearned} 
        onSpeak={vi.fn()}
      />
    );

    const learnButton = screen.getByText(/Marcar Aprendida/i);
    fireEvent.click(learnButton);
    expect(mockOnLearned).toHaveBeenCalled();
  });
});
