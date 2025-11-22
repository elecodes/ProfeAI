export default function FlashcardActions({
  showTranslation,
  setShowTranslation,
  learned,
  setLearned,
  onLearned,
}) {
  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={() => setShowTranslation((v) => !v)}
        className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200 px-4 py-2 rounded-lg text-sm font-medium"
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
  );
}
