import React, { useState, useEffect } from "react";
import { loadLessons } from "../utils/loadLessons.js";

function App() {
  const [nivel, setNivel] = useState("beginner");
  const [tema, setTema] = useState("");
  const [temasDisponibles, setTemasDisponibles] = useState([]);
  const [frases, setFrases] = useState([]);
  const [learned, setLearned] = useState([]);
  const [mode, setMode] = useState("study");
  const [showTranslation, setShowTranslation] = useState({});
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizOptions, setQuizOptions] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const speakText = async (text, language) => {
    try {
      if (window.currentAudio) {
        window.currentAudio.pause();
        window.currentAudio = null;
      }

      const response = await fetch("http://localhost:3001/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language }),
      });

      if (!response.ok) throw new Error("Error al generar audio");

      const arrayBuffer = await response.arrayBuffer();
      const audioBlob = new Blob([arrayBuffer], { type: "audio/mpeg" });
      const audioURL = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioURL);
      window.currentAudio = audio;

      audio.play();
      audio.onended = () => URL.revokeObjectURL(audioURL);
    } catch (err) {
      console.error("TTS error:", err);
    }
  };


  // === Cargar temas disponibles según el nivel ===
 useEffect(() => {
   const cargarContenido = async () => {
     if (!nivel) return;

     const semanas = await loadLessons(nivel);

     // Poner nombres de semanas en el sidebar
     setTemasDisponibles(semanas.map((s) => s.weekName));

     // Tomar la primera semana por defecto
     if (semanas.length > 0 && !tema) {
       setTema(semanas[0].weekName);
     }

     // Cargar frases de la semana seleccionada
     const selected = semanas.find((s) => s.weekName === tema);
     if (selected) {
       setFrases(selected.items);
     }
   };

   cargarContenido();
 }, [nivel, tema]);
  // === Manejo de frases aprendidas ===
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("learned")) || [];
    setLearned(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("learned", JSON.stringify(learned));
  }, [learned]);

  useEffect(() => {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }, []);


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
    if (!frases.length) return;
    setQuizIndex(0);
    setQuizScore(0);
    setQuizCompleted(false);
    setMode("quiz");
    generateOptions(0);
  };

  const generateOptions = (index) => {
    const correct = frases[index].translation;
    const wrong = frases
      .filter((_, i) => i !== index)
      .sort(() => 0.5 - Math.random())
      .slice(0, 2)
      .map((s) => s.translation);
    setQuizOptions([...wrong, correct].sort(() => 0.5 - Math.random()));
  };

  const handleAnswer = (option) => {
    const correct = frases[quizIndex].translation;
    if (option === correct) setQuizScore((s) => s + 1);
    const next = quizIndex + 1;
    if (next < frases.length) {
      setQuizIndex(next);
      generateOptions(next);
    } else {
      setQuizCompleted(true);
    }
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-blue-600">
            🇪🇸 Aprende Español
          </h1>

          <div className="flex items-center gap-3">
            <label htmlFor="nivel" className="text-sm text-gray-700">
              Nivel:
            </label>
            <select
              id="nivel"
              value={nivel}
              onChange={(e) => setNivel(e.target.value)}
              className="border rounded-lg px-2 py-1"
            >
              <option value="beginner">Principiante</option>
              <option value="intermediate">Intermedio</option>
              <option value="advanced">Avanzado</option>
            </select>

            <label htmlFor="tema" className="text-sm text-gray-700">
              Tema:
            </label>
            <select
              id="tema"
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              className="border rounded-lg px-2 py-1"
            >
              {temasDisponibles.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* === Contenido dinámico === */}
        {mode === "study" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {frases.map((s, i) => (
              <div
                key={i}
                className="p-4 bg-white rounded-2xl shadow hover:shadow-md transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-lg font-semibold text-gray-800">
                    {s.text}
                  </p>
                  <button
                    onClick={() => speakText(s.text, "es")}
                    className="text-blue-600 hover:text-blue-800 transition"
                    title="Escuchar frase en español"
                  >
                    🔊
                  </button>
                </div>

                {showTranslation[i] && (
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-600 italic">{s.translation}</p>
                    <button
                      onClick={() => speakText(s.translation, "en")}
                      className="text-green-600 hover:text-green-800 transition"
                      title="Escuchar traducción en inglés"
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
                    data-testid={`learned-btn-${i}`}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition"
                  >
                    Aprendida ✅
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Aprendidas */}
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

        {/* === Quiz === */}
        {mode === "quiz" && frases.length > 0 && (
          <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow text-center">
            {!quizCompleted ? (
              <>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Traduce:{" "}
                  <span className="text-blue-600">
                    {frases[quizIndex].text}
                  </span>
                </h2>
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
                  Pregunta {quizIndex + 1} / {frases.length}
                </p>
              </>
            ) : (
              <div>
                <h2 className="text-2xl font-semibold text-green-600 mb-3">
                  🎉 ¡Quiz completado!
                </h2>
                <p className="text-lg mb-4">
                  Puntuación: {quizScore} / {frases.length}
                </p>
                <button
                  onClick={startQuiz}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition"
                >
                  Repetir quiz 🔁
                </button>
              </div>
            )}
          </div>
        )}
      </main>
      {/* TODO: Uncomment when testing environment supports custom elements properly */}
      {/* <elevenlabs-convai agent-id="agent_5001k9j3ad8nfkr871pypnhj7m3r"></elevenlabs-convai> */}
    </div>
  );
}

export default App;
