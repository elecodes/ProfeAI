import React from 'react';

interface FlashcardAudioButtonsProps {
  english: string;
  spanish: string;
  speak: (text: string, lang: 'en' | 'es') => void;
}

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
