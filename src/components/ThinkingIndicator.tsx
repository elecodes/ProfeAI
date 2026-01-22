import React, { useState, useEffect } from 'react';

const MESSAGES = [
  "Analizando gramática...",
  "Buscando contexto...",
  "Traduciendo...",
  "Formulando respuesta...",
  "Revisando vocabulario...",
  "Pensando..."
];

/**
 * A visual indicator showing that the AI is processing the request.
 * Cycles through different status messages (e.g., "Translating...", "Thinking...") to keep the user engaged.
 */
export const ThinkingIndicator = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-start gap-2 p-4 animate-fade-in">
        <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm p-4 shadow-sm flex items-center gap-3">
            <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-[var(--color-accent)] rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-[var(--color-accent)] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-[var(--color-accent)] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            </div>
            <span className="text-sm font-medium text-[var(--color-secondary)] min-w-[140px] transition-all duration-300">
                {MESSAGES[messageIndex]}
            </span>
        </div>
    </div>
  );
};
