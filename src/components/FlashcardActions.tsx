import React from 'react';

/**
 * Props for FlashcardActions.
 */
interface FlashcardActionsProps {
  /** Current visibility state of the translation. */
  showTranslation: boolean;
  /** Setter for translation visibility. */
  setShowTranslation: React.Dispatch<React.SetStateAction<boolean>>;
  /** Whether the card has been marked as learned. */
  learned: boolean;
  /** Setter for learned state. */
  setLearned: React.Dispatch<React.SetStateAction<boolean>>;
  /** Callback fired when "Mark as learned" is clicked. */
  onLearned: () => void;
}

/**
 * Action buttons for a Flashcard (Toggle Translation, Mark Learned).
 * 
 * @param props - {@link FlashcardActionsProps}
 */
export default function FlashcardActions({
  showTranslation,
  setShowTranslation,
  learned,
  setLearned,
  onLearned,
}: FlashcardActionsProps) {
  return (
    <div className="flex flex-col gap-4 mt-2">
      <button
        onClick={() => setShowTranslation((v) => !v)}
        className="text-[var(--color-accent)] hover:bg-[var(--color-accent)]/5 px-6 py-3 rounded-[var(--radius-btn)] text-sm font-semibold tracking-wide transition-colors border border-[var(--color-accent)]/20"
      >
        {showTranslation ? "Ocultar traducción" : "Ver traducción"}
      </button>

      <button
        onClick={() => {
          setLearned(true);
          onLearned();
        }}
        disabled={learned}
        className={
          learned
            ? "bg-[var(--color-success)] text-white px-6 py-3 rounded-[var(--radius-btn)] font-medium cursor-not-allowed opacity-80"
            : "bg-[var(--color-primary)] text-white hover:bg-gray-800 px-6 py-3 rounded-[var(--radius-btn)] font-medium transition-all shadow-lg shadow-gray-200"
        }
      >
        {learned ? "¡Aprendida!" : "Marcar como aprendida"}
      </button>
    </div>
  );
}
