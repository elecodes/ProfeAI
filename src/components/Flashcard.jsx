import { useState } from "react";

function Flashcard({ english, spanish, onLearned }) {
  const [showTranslation, setShowTranslation] = useState(false);

 const handleSpeak = async (text, lang = "es") => {
  try {
    const response = await fetch("http://localhost:3001/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, language: lang }),
    });

    if (!response.ok) throw new Error("Error al generar audio");

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.play();
  } catch (error) {
    console.error("Error al reproducir audio:", error);
  }
};



  return (
    <div className="p-6 bg-white shadow-md rounded-2xl border border-gray-200 hover:shadow-xl transition w-full max-w-lg mx-auto text-center relative">
      {/* Título con botones de audio */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-semibold text-gray-800">{english}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => handleSpeak(english, "en")}
            className="bg-blue-100 text-blue-600 hover:bg-blue-200 px-3 py-1 rounded-lg text-sm font-medium transition"
          >
            🇺🇸 🔊
          </button>
          <button
            onClick={() => handleSpeak(spanish, "es")}
            className="bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1 rounded-lg text-sm font-medium transition"
          >
            🇪🇸 🔊
          </button>
        </div>
      </div>

      {/* Traducción */}
      {showTranslation && (
        <p className="text-gray-600 text-lg mb-2 transition-all duration-500">
          {spanish}
        </p>
      )}

      {/* Botones de control */}
      <div className="mt-4 flex flex-col gap-2">
        <button
          onClick={() => setShowTranslation((prev) => !prev)}
          className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          {showTranslation ? "👀 Ocultar traducción" : "💡 Ver traducción"}
        </button>

        <button
          onClick={onLearned}
          className="bg-green-100 text-green-700 hover:bg-green-200 px-4 py-2 rounded-lg text-sm font-semibold transition"
        >
          ✅ Marcar como aprendida
        </button>
      </div>
    </div>
  );
}

export default Flashcard;
