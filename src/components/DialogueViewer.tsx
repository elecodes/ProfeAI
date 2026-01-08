import React, { useState } from "react";
import { useTTS } from "./hooks/useTTS";
import { Dialogue } from "../types/dialogue";

interface Props {
  dialogue: Dialogue | null;
}

const DialogueViewer: React.FC<Props> = ({ dialogue }) => {
  const { speak } = useTTS();
  const [showTranslation, setShowTranslation] = useState<Record<number, boolean>>({});
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  const handlePlay = async (text: string, index: number, gender: "male" | "female") => {
    setPlayingIndex(index);
    await speak(text, "es", { gender });
    setPlayingIndex(null);
  };

  const toggleTranslation = (index: number) => {
    setShowTranslation((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  if (!dialogue) return <div className="text-center text-gray-500">Selecciona un diálogo</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-blue-600 mb-6 text-center">
        {dialogue.title}
      </h2>

      <div className="space-y-6">
        {dialogue.lines.map((line, index) => (
          <div
            key={index}
            className={`flex ${
              index % 2 === 0 ? "justify-start" : "justify-end"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                index % 2 === 0
                  ? "bg-white rounded-tl-none border border-gray-100"
                  : "bg-blue-50 rounded-tr-none border border-blue-100"
              }`}
            >
              <div className="flex items-center justify-between mb-2 gap-4">
                <span className="font-bold text-sm text-gray-500">
                  {line.speaker}
                </span>
                <button
                  onClick={() => handlePlay(line.text, index, line.gender as "male" | "female")}
                  disabled={playingIndex !== null}
                  className={`p-2 rounded-full transition ${
                    playingIndex === index
                      ? "bg-blue-100 text-blue-600 animate-pulse"
                      : "hover:bg-gray-100 text-gray-600"
                  }`}
                  title="Escuchar"
                >
                  🔊
                </button>
              </div>

              <p className="text-lg text-gray-800 mb-2">{line.text}</p>

              {showTranslation[index] && (
                <p className="text-gray-600 italic border-t pt-2 mt-2 text-sm">
                  {line.translation}
                </p>
              )}

              <button
                onClick={() => toggleTranslation(index)}
                className="text-xs text-blue-500 hover:text-blue-700 mt-2"
              >
                {showTranslation[index] ? "Ocultar traducción" : "Ver traducción"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DialogueViewer;
