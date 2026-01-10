import React from 'react';

interface FlashcardAudioButtonsProps {
  english: string;
  spanish: string;
  speak: (text: string, lang: 'en' | 'es') => void;
}

export default function FlashcardAudioButtons({ english, spanish, speak }: FlashcardAudioButtonsProps) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => speak(english, "en")}
        className="bg-blue-100 text-blue-600 hover:bg-blue-200 px-3 py-1 rounded-lg text-sm font-medium transition"
      >
        🇺🇸 🔊
      </button>

      <button
        onClick={() => speak(spanish, "es")}
        className="bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1 rounded-lg text-sm font-medium transition"
      >
        🇪🇸 🔊
      </button>
    </div>
  );
}
