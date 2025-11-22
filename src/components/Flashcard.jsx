import { useState } from "react";
import { useTTS } from "./useTTS";
import FlashcardText from "./FlashcardText";
import FlashcardAudioButtons from "./FlashcardAudioButtons";
import FlashcardActions from "./FlashcardActions";

export default function Flashcard({ english, spanish, onLearned }) {
  const [showTranslation, setShowTranslation] = useState(false);
  const [learned, setLearned] = useState(false);
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
