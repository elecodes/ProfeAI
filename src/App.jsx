import React, { useState, useEffect } from "react";
//import { lessons } from "./data/lessons";
import { lessons } from "public/lessons/lessons.json";

function App() {
  const [data, setData] = useState([]);
  const [learned, setLearned] = useState([]);
  const [numSentences, setNumSentences] = useState(5);
  const [mode, setMode] = useState("study");
  const [topic, setTopic] = useState("general");
  const [nivel, setNivel] = useState("principiante"); // ✅ nuevo
  const [temasDisponibles, setTemasDisponibles] = useState([]); // ✅ nuevo
  const [showTranslation, setShowTranslation] = useState({});
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizOptions, setQuizOptions] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // === Local Storage ===
  useEffect(() => {
    const savedLearned = JSON.parse(localStorage.getItem("learned")) || [];
    setLearned(savedLearned);
  }, []);

  useEffect(() => {
    localStorage.setItem("learned", JSON.stringify(learned));
  }, [learned]);

  // === Cargar lecciones ===
  useEffect(() => {
    const all = lessons[topic] || [];
    const filtered = all.filter((s) => !learned.find((l) => l.text === s.text));
    setData(filtered.slice(0, numSentences));
  }, [topic, numSentences, learned]);

  // === Cargar temas por nivel ===
  useEffect(() => {
    async function cargarTemas() {
      try {
        const response = await fetch("/lessons/index.json");
        const data = await response.json();
        setTemasDisponibles(data[nivel] || []);
      } catch (error) {
        console.warn("No se pudo cargar index.json, usando temas por defecto.");
        setTemasDisponibles(["general", "travel", "food", "work"]);
      }
    }
    cargarTemas();
  }, [nivel]);

  // === Funciones ===
  const handleMarkLearned = (sentence) => {
    setLearned([...learned, sentence]);
  };

  const handleClearLearned = () => {
    setLearned([]);
    localStorage.removeItem("learned");
  };

  const handleToggleTranslation = (index) => {
    setShowTranslation((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // === Quiz ===
  const startQuiz = () => {
    setQuizIndex(0);
    setQuizScore(0);
    setQuizCompleted(false);
    setMode("quiz");
    generateOptions(0);
  };

  const generateOptions = (index) => {
    const correct = lessons[topic][index].translation;
    const wrong = lessons[topic]
      .filter((_, i) => i !== index)
      .sort(() => 0.5 - Math.random())
      .slice(0, 2)
      .map((s) => s.translation);
    setQuizOptions([...wrong, correct].sort(() => 0.5 - Math.random()));
  };

  const handleAnswer = (option) => {
    const correct = lessons[topic][quizIndex].translation;
    if (option === correct) setQuizScore((s) => s + 1);
    const next = quizIndex + 1;
    if (next < data.length) {
      setQuizIndex(next);
      generateOptions(next);
    } else {
      setQuizCompleted(true);
    }
  };

  // === Text-to-Speech ===
  const speakText = (text, lang = "en-US") => {
    if (!window.speechSynthesis) {
      alert("La síntesis de voz no está disponible en tu navegador.");
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  // === UI ===
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ===== Sidebar ===== */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-16"
        } bg-white border-r border-gray-200 p-4 transition-all duration-300`}
      >
        <button
          className="text-gray-600 mb-6 hover:text-blue-600"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? "⬅️" : "➡️"}
        </button>

        <nav className="flex flex-col gap-3">
          <button
            onClick={() => setMode("study")}
            className={`text-left px-3 py-2 rounded-lg transition ${
              mode === "study"
                ? "bg-blue-500 text-white"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            🧠 {sidebarOpen && "Estudiar"}
          </button>

          <button
            onClick={() => setMode("learned")}
            className={`text-left px-3 py-2 rounded-lg transition ${
              mode === "learned"
                ? "bg-blue-500 text-white"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            ✅ {sidebarOpen && "Aprendidas"}
          </button>

          <button
            onClick={startQuiz}
            className={`text-left px-3 py-2 rounded-lg transition ${
              mode === "quiz"
                ? "bg-blue-500 text-white"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            🎯 {sidebarOpen && "Quiz"}
          </button>

          <button
            onClick={handleClearLearned}
            className="text-left px-3 py-2 rounded-lg text-gray-600 hover:bg-red-100 hover:text-red-600 transition"
          >
            🗑️ {sidebarOpen && "Borrar aprendidas"}
          </button>
        </nav>
      </aside>

      {/* ===== Main content ===== */}
      <main className="flex-1 p-6">
        {/* Barra superior */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
          <h1 className="text-2xl font-bold text-blue-600">🌎 LearnLang</h1>

          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-700">Nivel:</label>
            <select
              value={nivel}
              onChange={(e) => setNivel(e.target.value)}
              className="border rounded-lg px-2 py-1"
            >
              <option value="principiante">Principiante</option>
              <option value="intermedio">Intermedio</option>
              <option value="avanzado">Avanzado</option>
            </select>

            <label className="text-sm text-gray-700">Tema:</label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="border rounded-lg px-2 py-1"
            >
              {temasDisponibles.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>

            <label className="text-sm text-gray-700">Frases:</label>
            <select
              value={numSentences}
              onChange={(e) => setNumSentences(Number(e.target.value))}
              className="border rounded-lg px-2 py-1"
            >
              <option value="3">3</option>
              <option value="5">5</option>
              <option value="10">10</option>
            </select>
          </div>
        </div>

        {/* Barra de progreso */}
        {mode === "study" && (
          <div className="w-full max-w-2xl mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>
                Progreso: {learned.length}/{numSentences}
              </span>
              <span>{Math.round((learned.length / numSentences) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 h-3 rounded-full">
              <div
                className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    (learned.length / numSentences) * 100,
                    100
                  )}%`,
                }}
              ></div>
            </div>
          </div>
        )}

        {/* === Contenido dinámico === */}
        {mode === "study" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.map((s, i) => (
              <div
                key={i}
                className="p-4 bg-white rounded-2xl shadow hover:shadow-md transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-lg font-semibold text-gray-800">
                    {s.text}
                  </p>
                  <button
                    onClick={() => speakText(s.text, "en-US")}
                    className="text-blue-600 hover:text-blue-800 transition"
                    title="Escuchar frase en inglés"
                  >
                    🔊
                  </button>
                </div>

                {showTranslation[i] && (
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-600 italic">{s.translation}</p>
                    <button
                      onClick={() => speakText(s.translation, "es-ES")}
                      className="text-green-600 hover:text-green-800 transition"
                      title="Escuchar traducción en español"
                    >
                      🔊
                    </button>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleTranslation(i)}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                  >
                    {showTranslation[i] ? "Ocultar" : "Ver traducción"}
                  </button>
                  <button
                    onClick={() => handleMarkLearned(s)}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition"
                  >
                    Aprendida ✅
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {mode === "learned" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Frases aprendidas</h2>
            {learned.length === 0 ? (
              <p className="text-gray-600">Aún no has marcado ninguna frase.</p>
            ) : (
              <ul className="list-disc pl-5 space-y-1">
                {learned.map((l, i) => (
                  <li key={i} className="text-gray-800">
                    {l.text}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* === Modo Quiz === */}
        {mode === "quiz" && (
          <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow text-center">
            {!quizCompleted ? (
              <>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Traduce:{" "}
                    <span className="text-blue-600">
                      {data[quizIndex].text}
                    </span>
                  </h2>
                  <button
                    onClick={() => speakText(data[quizIndex].text, "en-US")}
                    className="text-blue-600 hover:text-blue-800 transition"
                    title="Escuchar frase"
                  >
                    🔊
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  {quizOptions.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleAnswer(opt)}
                      className="bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 hover:bg-blue-100 transition"
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                <p className="mt-4 text-gray-600 text-sm">
                  Pregunta {quizIndex + 1} / {data.length}
                </p>

                <button
                  onClick={() => setMode("study")}
                  className="mt-6 bg-gray-400 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-500 transition"
                >
                  ⬅️ Volver al menú principal
                </button>
              </>
            ) : (
              <div>
                <h2 className="text-2xl font-semibold text-green-600 mb-3">
                  🎉 ¡Quiz completado!
                </h2>
                <p className="text-lg mb-4">
                  Puntuación: {quizScore} / {data.length}
                </p>
                <button
                  onClick={startQuiz}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition"
                >
                  Repetir quiz 🔁
                </button>
                <button
                  onClick={() => setMode("study")}
                  className="ml-3 bg-gray-400 text-white px-4 py-2 rounded-lg shadow hover:bg-gray-500 transition"
                >
                  Volver al menú principal
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
