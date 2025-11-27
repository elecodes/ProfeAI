import React, { useState, useEffect } from "react";
import { loadLessons } from "../utils/loadLessons.js";
import { useTTS } from "./components/hooks/useTTS";
import AuthForm from "./components/auth/AuthForm";
import { useAuth } from "./hooks/useAuth";
import UserService from "./services/UserService";
import { AGENT_IDS } from "./config/agents";
import DialogueViewer from "./components/DialogueViewer";
import DialogueGenerator from "./components/DialogueGenerator";
import { dialogues } from "./lessons/dialogues";

function App() {
  // Auth State from Hook
  const { user, userProfile, loading: authLoading, signIn, signUp, signOut } = useAuth();

  // App State
  const [nivel, setNivel] = useState("beginner");
  const [tema, setTema] = useState("");
  const [temasDisponibles, setTemasDisponibles] = useState([]);
  const [frases, setFrases] = useState([]);
  const [learned, setLearned] = useState([]);
  const [mode, setMode] = useState("study"); // study, learned, quiz, conversation, dialogues
  const [showTranslation, setShowTranslation] = useState({});
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizOptions, setQuizOptions] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedDialogue, setSelectedDialogue] = useState(null);
  const [showGenerator, setShowGenerator] = useState(false);

  // Use TTS hook with automatic fallback
  const { speak } = useTTS();

  const speakText = (text, language) => {
    speak(text, language);
  };

  // === Auth Handlers ===
  const handleSignIn = async (formData) => {
    await signIn(formData.email, formData.password);
  };

  const handleSignUp = async (formData) => {
    await signUp(formData.email, formData.password);
  };

  const handleLogout = async () => {
    await signOut();
    setMode("study");
    setLearned([]); // Clear local state on logout
  };

  // === Sync with User Profile ===
  useEffect(() => {
    if (userProfile) {
      if (userProfile.level) setNivel(userProfile.level);
      if (userProfile.learnedPhrases) setLearned(userProfile.learnedPhrases);
    }
  }, [userProfile]);

  // === Update selected dialogue when level changes ===
  useEffect(() => {
    if (mode === "dialogues") {
      const levelDialogues = dialogues[nivel] || [];
      if (levelDialogues.length > 0) {
        setSelectedDialogue(levelDialogues[0]);
      } else {
        setSelectedDialogue(null);
      }
    }
  }, [nivel, mode]);

  // === Cargar temas disponibles según el nivel ===
  useEffect(() => {
    const cargarContenido = async () => {
      if (!nivel) return;

      const todasLasSemanas = await loadLessons(nivel);
      
      // Sort by week number if available
      todasLasSemanas.sort((a, b) => (a.week || 99) - (b.week || 99));

      // Filter based on unlocked weeks
      let unlockedCount = 1;
      if (userProfile && userProfile.createdAt) {
        unlockedCount = UserService.getUnlockedWeeks(userProfile);
      }

      // Mark lessons as locked/unlocked
      const processedWeeks = todasLasSemanas.map(lesson => ({
        ...lesson,
        locked: (lesson.week || 1) > unlockedCount
      }));

      // Poner nombres de semanas en el sidebar (con candado si están bloqueadas)
      setTemasDisponibles(processedWeeks);

      // Tomar la primera semana por defecto si no hay tema seleccionado
      if (processedWeeks.length > 0 && !tema) {
        setTema(processedWeeks[0].weekName);
      }

      // Cargar frases de la semana seleccionada
      const selected = processedWeeks.find((s) => s.weekName === tema);
      if (selected) {
        if (selected.locked) {
          setFrases([]); // No mostrar frases si está bloqueado
        } else {
          setFrases(selected.items);
        }
      }
    };

    cargarContenido();
  }, [nivel, tema, userProfile]);

  useEffect(() => {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }, []);

  const handleMarkLearned = async (sentence) => {
    // Optimistic update
    const newLearned = [...learned, sentence];
    setLearned(newLearned);
    
    // Save to Firestore
    if (user) {
      await UserService.addLearnedPhrase(user.uid, sentence);
    }
  };


  const handleClearLearned = async () => {
    setLearned([]);
    if (user) {
      await UserService.updateUserProgress(user.uid, { learnedPhrases: [] });
    }
  };

  const handleToggleTranslation = (index) => {
    setShowTranslation((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleDialogueGenerated = (newDialogue) => {
    setSelectedDialogue(newDialogue);
    setShowGenerator(false);
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

  const handleAnswer = async (option) => {
    const correct = frases[quizIndex].translation;
    let newScore = quizScore;
    if (option === correct) {
      newScore = quizScore + 1;
      setQuizScore(newScore);
    }
    
    const next = quizIndex + 1;
    if (next < frases.length) {
      setQuizIndex(next);
      generateOptions(next);
    } else {
      setQuizCompleted(true);
      // Save quiz result to history
      if (user) {
        await UserService.recordSession(user.uid, {
          type: "quiz",
          score: newScore,
          total: frases.length,
          level: nivel,
          topic: tema
        });
      }
    }
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  // === UI ===
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ===== Sidebar ===== */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-16"
        } bg-white border-r border-gray-200 p-4 transition-all duration-300 flex flex-col`}
      >
        <button
          className="text-gray-600 mb-6 hover:text-blue-600 self-start"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? "⬅️" : "➡️"}
        </button>

        <nav className="flex flex-col gap-3 flex-1">
          <button
            onClick={() => setMode("study")}
            className={`text-left px-3 py-2 rounded-lg transition ${
              mode === "study"
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            🧠 {sidebarOpen && "Estudiar"}
          </button>

          <button
            onClick={() => setMode("learned")}
            disabled={!user}
            className={`text-left px-3 py-2 rounded-lg transition ${
              mode === "learned"
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-100 text-gray-700"
            } ${!user ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            ✅ {sidebarOpen && "Aprendidas"}
          </button>

          <button
            onClick={startQuiz}
            disabled={!user}
            className={`text-left px-3 py-2 rounded-lg transition ${
              mode === "quiz"
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-100 text-gray-700"
            } ${!user ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            🎯 {sidebarOpen && "Quiz"}
          </button>

          <button
            onClick={() => setMode("conversation")}
            className={`text-left px-3 py-2 rounded-lg transition ${
              mode === "conversation"
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            💬 {sidebarOpen && "Conversación"}
          </button>

          <button
            onClick={() => setMode("dialogues")}
            className={`text-left px-3 py-2 rounded-lg transition ${
              mode === "dialogues"
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            🗣️ {sidebarOpen && "Diálogos"}
          </button>

          {user && (
            <button
              onClick={handleClearLearned}
              className="text-left px-3 py-2 rounded-lg text-gray-600 hover:bg-red-100 hover:text-red-600 transition"
            >
              🗑️ {sidebarOpen && "Borrar aprendidas"}
            </button>
          )}
        </nav>

        {/* User Info / Logout */}
        {sidebarOpen && user && (
          <div className="mt-auto pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2 truncate">
              👤 {user.displayName || user.email}
            </p>
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition text-sm"
            >
              Cerrar sesión
            </button>
          </div>
        )}
      </aside>

      {/* ===== Main content ===== */}
      <main className="flex-1 p-6 flex flex-col">
        {/* Barra superior */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-blue-600">
              🇪🇸 Aprende Español
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <label htmlFor="nivel" className="text-sm text-gray-700">
              Nivel:
            </label>
            <select
              id="nivel"
              value={nivel}
              onChange={(e) => {
                setNivel(e.target.value);
                if (user) UserService.updateUserProgress(user.uid, { level: e.target.value });
              }}
              className="border rounded-lg px-2 py-1"
            >
              <option value="beginner">Principiante</option>
              <option value="intermediate">Intermedio</option>
              <option value="advanced">Avanzado</option>
            </select>

            {mode === "study" && (
              <>
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
                    <option key={t.weekName} value={t.weekName}>
                      {t.locked ? "🔒 " : ""}{t.weekName}
                    </option>
                  ))}
                </select>
              </>
            )}
            
            {mode === "dialogues" && (
              <>
                <div className="flex items-center gap-2">
                  <label htmlFor="dialogue" className="text-sm text-gray-700">
                    Diálogo:
                  </label>
                  <select
                    id="dialogue"
                    value={selectedDialogue?.id || ""}
                    onChange={(e) => {
                      const d = dialogues[nivel]?.find(d => d.id === e.target.value);
                      setSelectedDialogue(d);
                      setShowGenerator(false);
                    }}
                    className="border rounded-lg px-2 py-1"
                  >
                    {(dialogues[nivel] || []).map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.title}
                      </option>
                    ))}
                    {selectedDialogue?.id?.startsWith('gen_') && (
                      <option value={selectedDialogue.id}>
                        ✨ {selectedDialogue.title}
                      </option>
                    )}
                  </select>
                  
                  <button
                    onClick={() => setShowGenerator(!showGenerator)}
                    className={`px-3 py-1 rounded-lg text-sm transition ${
                      showGenerator 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-gray-100 text-gray-600 hover:bg-purple-50 hover:text-purple-600'
                    }`}
                  >
                    {showGenerator ? 'Cancelar' : '✨ Generar Nuevo'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* === Contenido dinámico === */}
        {!user ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-md">
              <div className="text-center mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  🔒 Acceso Restringido
                </h2>
                <p className="text-gray-600">
                  Inicia sesión para acceder a las lecciones y guardar tu progreso.
                </p>
              </div>
              <AuthForm onSignIn={handleSignIn} onSignUp={handleSignUp} />
            </div>
          </div>
        ) : (
          <>
            {/* Locked Content Message */}
            {mode === "study" && temasDisponibles.find(t => t.weekName === tema)?.locked && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center p-8 bg-gray-100 rounded-2xl">
                  <span className="text-4xl mb-4 block">🔒</span>
                  <h2 className="text-xl font-bold text-gray-800 mb-2">
                    Contenido Bloqueado
                  </h2>
                  <p className="text-gray-600">
                    Esta lección estará disponible la próxima semana.
                    <br/>
                    ¡Sigue practicando las lecciones anteriores!
                  </p>
                </div>
              </div>
            )}

            {mode === "study" && !temasDisponibles.find(t => t.weekName === tema)?.locked && (
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
              <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow text-center mx-auto">
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

            {/* === Conversation Mode === */}
            {mode === "conversation" && (
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Práctica de Conversación
                  </h2>
                  <p className="text-gray-600">
                    Habla con nuestro tutor de IA para practicar tu español (Nivel: {nivel})
                  </p>
                </div>
                
                {/* The agent is rendered below, but we show a placeholder here if needed */}
                <div className="p-8 bg-white rounded-2xl shadow-lg border border-blue-100 max-w-2xl w-full">
                   <p className="text-center text-gray-500 italic mb-4">
                     Haz clic en el micrófono del agente para empezar a hablar.
                   </p>
                </div>
              </div>
            )}

            {/* === Dialogues Mode === */}
            {mode === "dialogues" && (
              <>
                {showGenerator ? (
                  <DialogueGenerator onGenerate={handleDialogueGenerated} level={nivel} />
                ) : (
                  <DialogueViewer dialogue={selectedDialogue} />
                )}
              </>
            )}
          </>
        )}
      </main>

      {/* Only render in non-test environments */}
      {import.meta.env.MODE !== 'test' && mode === "conversation" && (
        <elevenlabs-convai agent-id={AGENT_IDS[nivel] || AGENT_IDS.beginner}></elevenlabs-convai>
      )}
    </div>
  );
}

export default App;
