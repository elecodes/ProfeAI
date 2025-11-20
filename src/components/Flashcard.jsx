import { useState } from "react";
 

function Flashcard({ english, spanish, onLearned }) {
  const [showTranslation, setShowTranslation] = useState(false);
  const [learned, setLearned] = useState(false);

  const handleSpeak = async (text, lang = "es") => {
    try {
      // detener audio previo
      if (window.currentAudio) {
        window.currentAudio.pause();
        window.currentAudio = null;
      }

      const response = await fetch("http://localhost:3001/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language: lang }),
      });

      if (!response.ok) throw new Error("Audio generation failed");

      const arrayBuffer = await response.arrayBuffer();
      const audioBlob = new Blob([arrayBuffer], { type: "audio/mpeg" });
      const audioURL = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioURL);
      window.currentAudio = audio;

      audio.play();
      audio.onended = () => URL.revokeObjectURL(audioURL);
    } catch (error) {
      console.error("Audio error:", error);
    }
  };

  return (
    <div className="p-6 bg-white shadow-md rounded-2xl border border-gray-200 hover:shadow-xl transition w-full max-w-lg mx-auto text-center relative">
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

      {showTranslation && (
        <p className="text-gray-600 text-lg mb-2 transition-all duration-500">
          {spanish}
        </p>
      )}

      <div className="flex flex-col gap-3">
        <button
          onClick={() => setShowTranslation((prev) => !prev)}
          className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 px-4 py-2 rounded-lg text-sm font-medium transition"
        >
          {showTranslation ? "👀 Ocultar traducción" : "💡 Ver traducción"}
        </button>

        <button
          onClick={() => {
            setLearned(true);
            onLearned();
          }}
          disabled={learned}
          className={
            learned
              ? "bg-green-500 text-white px-4 py-2 rounded-lg cursor-not-allowed"
              : "bg-green-100 text-green-700 hover:bg-green-200 px-4 py-2 rounded-lg"
          }
        >
          {learned ? "✔️ Aprendida" : "✅ Marcar como aprendida"}
        </button>
      </div>
    </div>
  );
}

export default Flashcard;