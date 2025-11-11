import { useState } from "react";

function Flashcard({ english, spanish, onLearned }) {
  const [showTranslation, setShowTranslation] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLang, setCurrentLang] = useState(null); // 🇬🇧 o 🇪🇸

  // 🎧 Función genérica de reproducción
  const reproducirTTS = async (texto, idioma = "en") => {
    if (isPlaying) return;
    setIsPlaying(true);
    setCurrentLang(idioma === "en" ? "🇬🇧" : "🇪🇸");

    try {
      const response = await fetch("http://localhost:3001/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: texto, language: idioma }),
      });

      if (!response.ok) throw new Error("Error al generar audio");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);

      audio.onended = () => {
        setIsPlaying(false);
        setCurrentLang(null);
      };

      audio.onerror = () => {
        setIsPlaying(false);
        setCurrentLang(null);
      };

      audio.play();
    } catch (error) {
      console.error("Error al reproducir audio:", error);
      setIsPlaying(false);
      setCurrentLang(null);
    }
  };

  // 🎤 Click normal → inglés
  const handleSpeakEnglish = () => reproducirTTS(english, "en");

  // 🇪🇸 Click derecho → español
  const handleSpeakSpanish = (e) => {
    e.preventDefault();
    reproducirTTS(spanish, "es");
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-2xl border border-gray-200 hover:shadow-xl transition w-full max-w-lg mx-auto text-center relative">
      {/* Encabezado con audio */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-semibold text-gray-800">{english}</h2>

        <button
          onClick={handleSpeakEnglish}
          onContextMenu={handleSpeakSpanish}
          disabled={isPlaying}
          className={`${
            isPlaying
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-blue-100 text-blue-600 hover:bg-blue-200"
          } flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition`}
          title="Click: inglés 🇬🇧 — Click derecho: español 🇪🇸"
        >
          {isPlaying ? "🔊..." : "🔊"}{" "}
          {currentLang && <span>{currentLang}</span>}
        </button>
      </div>

      {/* Traducción */}
      <div
        className={`transition-all duration-500 ease-in-out ${
          showTranslation
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-3"
        }`}
      >
        {showTranslation && (
          <p className="text-gray-600 text-lg mb-2">{spanish}</p>
        )}
      </div>

      {/* Botón toggle de traducción */}
      <button
        onClick={() => setShowTranslation((prev) => !prev)}
        className={`mt-3 px-4 py-2 rounded-lg text-sm font-medium transition ${
          showTranslation
            ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
            : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
        }`}
      >
        {showTranslation ? "👀 Ocultar traducción" : "💡 Ver traducción"}
      </button>

      {/* Botón marcar como aprendida */}
      <button
        onClick={onLearned}
        className="mt-4 bg-green-100 text-green-700 hover:bg-green-200 px-4 py-1 rounded-lg text-sm font-semibold transition"
      >
        ✅ Marcar como aprendida
      </button>
    </div>
  );
}

export default Flashcard;
