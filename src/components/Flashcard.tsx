import React, { useState } from "react";
import { useTTS } from "./hooks/useTTS";
import FlashcardText from "./FlashcardText";
import FlashcardAudioButtons from "./FlashcardAudioButtons";
import FlashcardActions from "./FlashcardActions";

interface FlashcardProps {
  english: string;
  spanish: string;
  onLearned: () => void;
}

export default function Flashcard({ english, spanish, onLearned }: FlashcardProps) {
  const [showTranslation, setShowTranslation] = useState<boolean>(false);
  const [learned, setLearned] = useState<boolean>(false);
  const { speak } = useTTS();

  return (
    <div className="p-6 bg-white shadow-md rounded-2xl border border-gray-200 w-full max-w-lg mx-auto text-center">
      <div className="flex justify-between items-center mb-3">
        <FlashcardText
          english={english}
          spanish={spanish}
          showTranslation={showTranslation}
        />

        <FlashcardAudioButtons
          english={english}
          spanish={spanish}
          speak={speak}
        />
      </div>

      <FlashcardActions
        showTranslation={showTranslation}
        setShowTranslation={setShowTranslation}
        learned={learned}
        setLearned={setLearned}
        onLearned={onLearned}
      />
    </div>
  );
}
