import React, { useState } from 'react';

/**
 * Properties for the Flashcard component.
 */
interface FlashcardProps {
  /** The hidden text (generally native language) to be revealed. */
  text: string;           
  /** The visible text (generally target language) shown initially. */
  translation: string;    
  /** Callback to trigger text-to-speech. */
  onSpeak: (text: string, lang: string) => void;
  /** Callback to mark the card as "known" or "learned". */
  onMarkLearned: () => void;
  /** Language codes for TTS. Defaults to es/en. */
  langCode?: { target: string; native: string }; // e.g., 'es', 'en'
}

/**
 * A detailed, interactive Flashcard component.
 * 
 * Behavior:
 * - Shows the target language (translation) primarily.
 * - Allows flipping/revealing the native text.
 * - Supports keyboard navigation (Enter/Space to flip, Escape to close).
 * - Provides audio buttons for both languages.
 * 
 * @param props - {@link FlashcardProps}
 */
export const Flashcard: React.FC<FlashcardProps> = ({ 
  text, 
  translation, 
  onSpeak, 
  onMarkLearned,
  langCode = { target: 'es', native: 'en' }
}) => {
  // ISO-LATED STATE: uniquely confined to this component instance
  const [isOpen, setIsOpen] = useState(false);

  // Keyboard handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
    }
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault(); // Prevent scrolling on Space
        setIsOpen(!isOpen);
    }
  };

  return (
    <div 
        className="glass-panel p-6 rounded-[var(--radius-card)] flex flex-col gap-4 hover:shadow-lg transition-all duration-300 notranslate focus:ring-2 focus:ring-[var(--color-accent)] outline-none"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        role="button"
        aria-expanded={isOpen}
    >
      
      {/* Primary Side (Spanish) */}
      <div className="flex items-center justify-between">
        <p className="text-2xl font-serif font-medium text-[var(--color-primary)]">
          {translation}
        </p>
        <button
          onClick={() => onSpeak(translation, langCode.target)}
          className="text-[var(--color-secondary)] hover:text-[var(--color-primary)] hover:scale-110 transition p-2"
          title="Escuchar frase"
          aria-label="Escuchar frase en español"
        >
          🇪🇸 🔊
        </button>
      </div>

      {/* Secondary Side (English - Toggled) */}
      {isOpen && (
        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <p className="text-[var(--color-secondary)] italic font-sans">
            {text || "Translation missing"}
          </p>
          <button
            onClick={() => onSpeak(text, langCode.native)}
            className="text-[var(--color-secondary)] hover:text-[var(--color-primary)] hover:scale-110 transition p-2"
            title="Escuchar traducción"
            aria-label="Escuchar traducción en inglés"
          >
             🇺🇸 🔊
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-auto pt-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2 border border-[var(--color-accent)] text-[var(--color-accent)] rounded-[var(--radius-btn)] hover:bg-[var(--color-accent)] hover:text-white transition text-sm font-semibold"
        >
          {isOpen ? "Ocultar" : "Mostrar Inglés"}
        </button>
        <button
          onClick={onMarkLearned}
          className="px-4 py-2 bg-emerald-600 text-white rounded-[var(--radius-btn)] hover:bg-emerald-700 hover:scale-105 active:scale-95 transition-all duration-200 text-sm font-bold shadow-md tracking-wide"
        >
          Marcar Aprendida
        </button>
      </div>
    </div>
  );
};
