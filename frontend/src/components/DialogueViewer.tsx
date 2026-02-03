import React, { useState } from "react";
import { useTTS } from "./hooks/useTTS";
import { Dialogue } from "../types/dialogue";

/**
 * Props for DialogueViewer.
 */
interface Props {
  /** The dialogue object containing lines, title, and metadata. */
  dialogue: Dialogue | null;
}

/**
 * Displays a full conversation/dialogue between two AI speakers.
 * 
 * Features:
 * - Alternates styling for speakers (Left/Right alignment).
 * - Plays individual lines using TTS.
 * - Collapsible translation for each line.
 * 
 * @param props - {@link Props}
 */
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
      <h2 className="text-2xl font-bold text-slate-700 mb-6 text-center">
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
              className={`max-w-[80%] p-6 shadow-sm transition-all ${
                index % 2 === 0
                  ? "bg-white border border-gray-100 rounded-[24px] rounded-tl-sm text-[var(--color-primary)]"
                  : "bg-slate-600 text-white rounded-[24px] rounded-tr-sm shadow-md"
              }`}
            >
              <div className="flex items-center justify-between mb-3 gap-6">
                <span className={`text-xs font-bold uppercase tracking-widest ${
                    index % 2 === 0 ? "text-[var(--color-secondary)]" : "text-[var(--color-accent)]"
                }`}>
                  {line.speaker}
                </span>
                <button
                  onClick={() => handlePlay(line.text, index, line.gender as "male" | "female")}
                  disabled={playingIndex !== null}
                  className={`p-2 rounded-full transition hover:scale-110 ${
                    playingIndex === index
                      ? "text-[var(--color-accent)] animate-pulse"
                      : index % 2 === 0 ? "text-[var(--color-secondary)] hover:text-[var(--color-primary)]" : "text-white/70 hover:text-white"
                  }`}
                  title="Escuchar"
                  aria-label={`Escuchar línea de ${line.speaker}`}
                >
                  🔊
                </button>
              </div>

              <p className={`text-xl leading-relaxed ${index % 2 === 0 ? "font-serif" : "font-sans"}`}>
                  {line.text}
              </p>

              {showTranslation[index] && (
                <p className={`italic border-t pt-3 mt-3 text-sm ${
                    index % 2 === 0 ? "border-gray-100 text-[var(--color-secondary)]" : "border-white/20 text-white/80"
                }`}>
                  {line.translation}
                </p>
              )}

              <button
                onClick={() => toggleTranslation(index)}
                className={`text-xs mt-3 block font-medium hover:underline ${
                    index % 2 === 0 ? "text-[var(--color-secondary)]" : "text-[var(--color-accent)]"
                }`}
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
