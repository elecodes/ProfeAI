import React from 'react';

/**
 * Props for FlashcardText.
 */
interface FlashcardTextProps {
  /** The primary text (usually English/Native). */
  english: string;
  /** The secondary text (usually Spanish/Target). */
  spanish: string;
  /** Whether to show the secondary text. */
  showTranslation: boolean;
}

/**
 * Displays the main content text of a flashcard.
 * Handles the animated reveal of the translation.
 * 
 * @param props - {@link FlashcardTextProps}
 */
export default function FlashcardText({ english, spanish, showTranslation }: FlashcardTextProps) {
  return (
    <>
      <div className="mb-2">
         {/* Label */}
         <span className="text-xs uppercase tracking-[0.2em] text-[var(--color-accent)] font-semibold">
            English Phrase
         </span>
      </div>
      <h2 className="text-4xl font-serif text-[var(--color-primary)] font-medium leading-tight my-4">
        {english}
      </h2>

      <div className={`transition-all duration-300 overflow-hidden ${showTranslation ? 'max-h-20 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
         {showTranslation && (
            <p className="text-[var(--color-secondary)] text-lg font-sans border-t border-gray-200 pt-4">
                {spanish}
            </p>
         )}
      </div>
    </>
  );
}
