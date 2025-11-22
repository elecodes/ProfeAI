export default function FlashcardText({ english, spanish, showTranslation }) {
  return (
    <>
      <h2 className="text-xl font-semibold text-gray-800">{english}</h2>

      {showTranslation && (
        <p className="text-gray-600 text-lg mb-2">{spanish}</p>
      )}
    </>
  );
}
