import React from 'react';

/**
 * Props for FlashcardAudioButtons.
 */
interface FlashcardAudioButtonsProps {
  /** The English text to be spoken. */
  english: string;
  /** The Spanish text to be spoken. */
  spanish: string;
  /**
   * Function to handle text-to-speech execution.
   * @param text - The content to speak.
   * @param lang - The language of the text.
   */
  speak: (text: string, lang: 'en' | 'es') => void;
}

/**
 * A sub-component used generally within Flashcards to provide audio playback buttons for both languages.
 * 
 * @param props - {@link FlashcardAudioButtonsProps}
 * @returns A set of buttons for triggering TTS in Spanish and English.
 */
export default function FlashcardAudioButtons({ english, spanish, speak }: FlashcardAudioButtonsProps) {
  return (
    <div className="flex gap-4 justify-center mt-2">
      <button
        onClick={() => speak(english, "en")}
        title="Escuchar inglés"
        className="text-[var(--color-secondary)] hover:text-[var(--color-primary)] hover:scale-110 transition-all p-2"
      >
        <span className="text-xl">🇺🇸</span>
      </button>

      <button
        onClick={() => speak(spanish, "es")}
        title="Escuchar español"
        className="text-[var(--color-secondary)] hover:text-[var(--color-primary)] hover:scale-110 transition-all p-2"
      >
        <span className="text-xl">🇪🇸</span>
      </button>
    </div>
  );
}
