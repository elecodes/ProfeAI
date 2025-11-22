export default function FlashcardAudioButtons({ english, spanish, speak }) {
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
