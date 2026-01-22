import React, { useState, useEffect, Suspense } from "react";
import { loadLessons } from "../utils/loadLessons";
import { useTTS } from "../components/hooks/useTTS";
import { useAuth } from "../hooks/useAuth";
import UserService from "../services/UserService";
import { dialogues } from "../lessons/dialogues";
import * as Sentry from "@sentry/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lesson, LearnedPhrase } from "../types";

// Lazy load components
const AuthForm = React.lazy(() => import("../components/auth/AuthForm"));
const DialogueViewer = React.lazy(() => import("../components/DialogueViewer"));
const DialogueGenerator = React.lazy(() => import("../components/DialogueGenerator"));
import { Flashcard } from "../components/Flashcard";

// Local type for items within a lesson
interface Phrase {
  id?: string;
  text: string;
  translation: string;
}

// Helper to access dialogues safely
const getDialoguesForLevel = (level: string) => {
  return dialogues[level] || [];
};

// Simple Loading Component
const Loading = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

const HomePage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Auth State from Hook
  const { user, userProfile, loading: authLoading, signIn, signUp } = useAuth();

  // App State
  const [nivel, setNivel] = useState<string>("beginner");
  const [tema, setTema] = useState<string>("");
  const [temasDisponibles, setTemasDisponibles] = useState<Lesson[]>([]);
  const [frases, setFrases] = useState<Phrase[]>([]);
  const [learned, setLearned] = useState<Phrase[]>([]);
  
  // Mode derived from URL, default to 'study'
  const mode = searchParams.get("mode") || "study";
  
  const setMode = (newMode: string) => {
      setSearchParams({ mode: newMode });
  };

  const [quizIndex, setQuizIndex] = useState<number>(0);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [selectedDialogue, setSelectedDialogue] = useState<any>(null);
  const [showGenerator, setShowGenerator] = useState<boolean>(false);

  // Track navigation in Sentry
  useEffect(() => {
    Sentry.addBreadcrumb({
      category: "navigation",
      message: `User switched to mode: ${mode}`,
      level: "info",
      data: {
        mode,
        level: nivel,
        topic: tema
      }
    });
  }, [mode, nivel, tema]);

  // Use TTS hook with automatic fallback
  const { speak } = useTTS();

  const speakText = (text: string, language: string) => {
    speak(text, language);
  };

  // === Auth Handlers ===
  const handleSignIn = async (formData: any) => {
    await signIn(formData.email, formData.password);
  };

  const handleSignUp = async (formData: any) => {
    await signUp(formData.email, formData.password);
  };

  // === Sync with User Profile ===
  useEffect(() => {
    if (userProfile) {
      if ((userProfile as any).level) setNivel((userProfile as any).level);
      if ((userProfile as any).learnedPhrases) setLearned((userProfile as any).learnedPhrases);
    }
  }, [userProfile]);

  // === Update selected dialogue when level changes ===
  useEffect(() => {
    if (mode === "dialogues") {
      const levelDialogues = getDialoguesForLevel(nivel);
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
      todasLasSemanas.sort((a: any, b: any) => (a.week || 99) - (b.week || 99));

      // Filter based on unlocked weeks
      let unlockedCount = 1;
      if (userProfile && (userProfile as any).createdAt) {
        unlockedCount = UserService.getUnlockedWeeks(userProfile);
      }

      // Mark lessons as locked/unlocked
      const processedWeeks = todasLasSemanas.map((lesson: any) => ({
        ...lesson,
        locked: (lesson.week || 1) > unlockedCount
      }));

      // Poner nombres de semanas en el sidebar (con candado si están bloqueadas)
      setTemasDisponibles(processedWeeks);

      // Cargar frases de la semana seleccionada
      const selected = processedWeeks.find((s: any) => s.weekName === tema);
      
      if (selected) {
        if (selected.locked) {
          setFrases([]); // No mostrar frases si está bloqueado
        } else {
          setFrases(selected.items || []);
        }
      } else {
        // Si el tema actual no existe en este nivel (ej: cambio de nivel),
        // seleccionar el primero disponible
        if (processedWeeks.length > 0) {
          setTema(processedWeeks[0].weekName || "");
          // Opcional: limpiar frases mientras cambia
          setFrases([]); 
        } else {
          setFrases([]);
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

  const handleMarkLearned = async (sentence: Phrase) => {
    // Adapter for LearnedPhrase type
    // SWAPPED: Saving Spanish (translation) as 'original' so it appears as primary
    const learnedPhrase: LearnedPhrase = {
      original: sentence.translation,
      translation: sentence.text,
      dateLearned: new Date().toISOString(),
      // prompt/context are optional
    };

    // Optimistic update - local state
    // We create a new object swapping text/translation for display consistency
    const displayPhrase = {
        ...sentence,
        text: sentence.translation,      // Display Spanish
        translation: sentence.text       // Translation is English
    };

    const newLearned = [...learned, displayPhrase]; 
    setLearned(newLearned);
    
    // Save to Firestore
    if (user) {
      await UserService.addLearnedPhrase((user as any).uid, learnedPhrase);
    }
  };


  const handleClearLearned = async () => {
    setLearned([]);
    if (user) {
      await UserService.updateUserProgress((user as any).uid, { learnedPhrases: [] });
    }
  };

  const handleDialogueGenerated = (newDialogue: any) => {
    setSelectedDialogue(newDialogue);
    setShowGenerator(false);
  };

  // === Quiz ===
  const generateOptions = (index: number) => {
    if (!frases[index]) return;
    const correct = frases[index].translation;
    const wrong = frases
      .filter((_, i) => i !== index)
      .sort(() => 0.5 - Math.random())
      .slice(0, 2)
      .map((s) => s.translation);
    setQuizOptions([...wrong, correct].sort(() => 0.5 - Math.random()));
  };

  const startQuiz = () => {
    if (!frases.length) return;
    setQuizIndex(0);
    setQuizScore(0);
    setQuizCompleted(false);
    // Removed setMode("quiz") to avoid loop if called from effect
    generateOptions(0);
  };

  // Effect to initialize quiz when entering quiz mode
  useEffect(() => {
    // Only auto-start if we are in quiz mode, having phrases, and quiz seems uninitialized (index 0, no score, or just force reset if needed)
    // Checking quizOptions.length === 0 is safer to prevent reset on every render if React StrictMode runs twice
    if (mode === 'quiz' && frases.length > 0 && quizOptions.length === 0) {
        startQuiz();
    }
  }, [mode, frases]);

  const handleAnswer = async (option: string) => {
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
        // Cast to any to allow legacy fields like total and level
        await UserService.recordSession((user as any).uid, {
          type: "quiz",
          score: newScore,
          total: frases.length,
          level: nivel,
          topic: tema,
          date: new Date().toISOString() // Ensure date is present as per StudySession type
        } as any);
      }
    }
  };

  // Route to conversation
  const startConversation = () => {
    // Generate a simple sessionId
    const sessionId = `session_${Date.now()}`;
    const safeTopic = encodeURIComponent(tema || "General Conversation");
    const safeLevel = encodeURIComponent(nivel);
    
    // Navigate using URL parameters to match App.tsx route definition
    navigate(`/chat/${safeTopic}/${safeLevel}/${sessionId}`);
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  // === UI ===
  return (
    <div className="w-full">
      {/* ===== Main content (Full Width by default in Layout) ===== */}
      <main className="flex flex-col gap-8">
        
        {/* Navigation Tabs (Replacements for Sidebar items) */}
        {/* Navigation Tabs (Replacements for Sidebar items) */}
        {!user ? null : (
            <div className="flex flex-wrap gap-4 border-b border-gray-200 pb-4">
                <button
                    onClick={() => setMode("study")}
                    className={`px-6 py-2 rounded-full font-medium transition-all ${
                    mode === "study"
                        ? "bg-slate-700 text-white shadow-md"
                        : "bg-white text-[var(--color-secondary)] hover:text-slate-700 border border-gray-200"
                    }`}
                >
                    🧠 Frases
                </button>
                <button
                    onClick={() => setMode("learned")}
                    className={`px-6 py-2 rounded-full font-medium transition-all ${
                    mode === "learned"
                        ? "bg-slate-700 text-white shadow-md"
                        : "bg-white text-[var(--color-secondary)] hover:text-slate-700 border border-gray-200"
                    }`}
                >
                    ✅ Aprendidas
                </button>
                <button
                    onClick={() => setMode("quiz")}
                    className={`px-6 py-2 rounded-full font-medium transition-all ${
                    mode === "quiz"
                        ? "bg-slate-700 text-white shadow-md"
                        : "bg-white text-[var(--color-secondary)] hover:text-slate-700 border border-gray-200"
                    }`}
                >
                    🎯 Quiz
                </button>
                <button
                    onClick={() => setMode("dialogues")}
                    className={`px-6 py-2 rounded-full font-medium transition-all ${
                    mode === "dialogues"
                        ? "bg-slate-700 text-white shadow-md"
                        : "bg-white text-[var(--color-secondary)] hover:text-slate-700 border border-gray-200"
                    }`}
                >
                    🗣️ Diálogos
                </button>
                {/* Widget removed, back to global index.html */}
            </div>
        )}


        {/* Barra superior */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-serif font-bold text-[var(--color-primary)]">
              🇪🇸 Aprende Español
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
                <label htmlFor="nivel" className="text-sm font-bold uppercase tracking-widest text-[var(--color-secondary)]">
                Nivel:
                </label>
                <select
                id="nivel"
                value={nivel}
                onChange={(e) => {
                    const newLevel = e.target.value as any;
                    setNivel(newLevel);
                    if (user) UserService.updateUserProgress((user as any).uid, { level: newLevel });
                }}
                className="border border-gray-200 bg-white rounded-[var(--radius-btn)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-primary)]"
                >
                <option value="beginner">Principiante</option>
                <option value="intermediate">Intermedio</option>
                <option value="advanced">Avanzado</option>
                </select>
            </div>

            {mode === "study" && (
              <div className="flex items-center gap-2">
                <label htmlFor="tema" className="text-sm font-bold uppercase tracking-widest text-[var(--color-secondary)]">
                  Tema:
                </label>
                <select
                  id="tema"
                  value={tema}
                  onChange={(e) => setTema(e.target.value)}
                  className="border border-gray-200 bg-white rounded-[var(--radius-btn)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-primary)] max-w-[200px]"
                >
                  {temasDisponibles.map((t) => (
                    <option key={t.weekName} value={t.weekName}>
                      {t.locked ? "🔒 " : ""}{t.weekName}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            {mode === "dialogues" && (
              <>
                <div className="flex items-center gap-2">
                  <label htmlFor="dialogue" className="text-sm font-bold uppercase tracking-widest text-[var(--color-secondary)]">
                    Diálogo:
                  </label>
                  <select
                    id="dialogue"
                    value={selectedDialogue?.id || ""}
                    onChange={(e) => {
                      const d = getDialoguesForLevel(nivel).find((d: any) => d.id === e.target.value);
                      setSelectedDialogue(d);
                      setShowGenerator(false);
                    }}
                    className="border border-gray-200 bg-white rounded-[var(--radius-btn)] px-3 py-2 text-sm focus:outline-none focus:border-[var(--color-primary)] max-w-[200px]"
                  >
                    {getDialoguesForLevel(nivel).map((d: any) => (
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
                    className={`px-4 py-2 rounded-[var(--radius-btn)] text-sm font-bold tracking-wide transition ${
                      showGenerator 
                        ? 'bg-[var(--color-accent)] text-white' 
                        : 'bg-white border border-[var(--color-accent)] text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white'
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
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="w-full max-w-md bg-white p-8 rounded-[var(--radius-card)] shadow-lg text-center">
                <h2 className="text-2xl font-serif font-bold text-[var(--color-primary)] mb-4">
                  🔒 Acceso Restringido
                </h2>
                <p className="text-[var(--color-secondary)] mb-8">
                  Inicia sesión para acceder a las lecciones personalizadas y guardar tu progreso con la IA.
                </p>
              <Suspense fallback={<Loading />}>
                <AuthForm onSignIn={handleSignIn} onSignUp={handleSignUp} />
              </Suspense>
            </div>
          </div>
        ) : (
          <Suspense fallback={<Loading />}>
            {/* Locked Content Message */}
            {mode === "study" && temasDisponibles.find(t => t.weekName === tema)?.locked && (
              <div className="flex-1 flex items-center justify-center py-20">
                <div className="text-center p-10 bg-gray-100 rounded-[var(--radius-card)] border border-gray-200">
                  <span className="text-5xl mb-6 block">🔒</span>
                  <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-3">
                    Contenido Bloqueado
                  </h2>
                  <p className="text-[var(--color-secondary)]">
                    Esta lección estará disponible la próxima semana.
                    <br/>
                    ¡Sigue practicando las lecciones anteriores!
                  </p>
                </div>
              </div>
            )}

            {mode === "study" && !temasDisponibles.find(t => t.weekName === tema)?.locked && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {frases.map((s, i) => (
                  <Flashcard
                    key={`${s.id || 'missing'}-${i}`} // Strict unique key
                    text={s.text}
                    translation={s.translation}
                    onSpeak={speakText}
                    onMarkLearned={() => handleMarkLearned(s)}
                  />
                ))}
              </div>
            )}

            {/* Aprendidas */}
            {mode === "learned" && (
              <div className="glass-panel p-8 rounded-[var(--radius-card)]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-serif font-bold text-[var(--color-primary)]">Frases Aprendidas</h2>
                    {learned.length > 0 && (
                        <button
                            onClick={handleClearLearned}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-[var(--radius-btn)] transition-colors text-sm font-medium border border-red-200"
                            aria-label="Borrar todas las frases aprendidas"
                        >
                            🗑️ Borrar Todo
                        </button>
                    )}
                </div>
                {learned.length === 0 ? (
                  <p className="text-[var(--color-secondary)] italic">Aún no has marcado ninguna frase.</p>
                ) : (
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {learned.map((l, i) => (
                      <li key={i} className="bg-white/50 p-4 rounded-[var(--radius-btn)] border border-gray-100 flex items-center gap-3">
                         <span className="text-green-500">✅</span>
                        <span className="text-[var(--color-primary)] font-medium">{l.text}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* === Quiz === */}
            {mode === "quiz" && frases.length > 0 && (
              <div className="w-full max-w-lg glass-panel p-10 rounded-[var(--radius-card)] text-center mx-auto shadow-xl">
                {!quizCompleted ? (
                  <>
                    <h2 className="text-3xl font-serif font-bold text-[var(--color-primary)] mb-8">
                      Traduce:{" "}
                      <span className="text-[var(--color-accent)] block mt-2">
                        {frases[quizIndex].text}
                      </span>
                    </h2>
                    <div className="flex flex-col gap-4">
                      {quizOptions.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => handleAnswer(opt)}
                          className="bg-white border border-gray-200 rounded-[var(--radius-btn)] px-6 py-4 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-all duration-300 text-lg font-medium shadow-sm"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                    <p className="mt-8 text-[var(--color-secondary)] text-sm font-bold uppercase tracking-widest">
                      Pregunta {quizIndex + 1} / {frases.length}
                    </p>
                  </>
                ) : (
                  <div>
                    <h2 className="text-4xl font-display font-bold text-[var(--color-success)] mb-6">
                      🎉 ¡Quiz Completado!
                    </h2>
                    <div className="text-6xl font-black text-[var(--color-primary)] mb-8">
                        {quizScore} <span className="text-2xl text-[var(--color-secondary)] font-normal">/ {frases.length}</span>
                    </div>
                    <button
                      onClick={startQuiz}
                      className="bg-[var(--color-primary)] text-white px-8 py-3 rounded-[var(--radius-btn)] shadow-lg hover:bg-black transition font-bold tracking-wide"
                    >
                      Repetir Quiz 🔁
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* === Dialogues Mode === */}
            {mode === "dialogues" && (
              <>
                <Suspense fallback={<Loading />}>
                  {showGenerator ? (
                    <DialogueGenerator onGenerate={handleDialogueGenerated} level={nivel} />
                  ) : (
                    <DialogueViewer dialogue={selectedDialogue} />
                  )}
                </Suspense>
              </>
            )}

            {/* === Chat Mode === */}
            {mode === "chat" && (
                <div className="glass-panel p-10 rounded-[var(--radius-card)] text-center max-w-2xl mx-auto shadow-lg">
                    <h2 className="text-3xl font-serif font-bold text-[var(--color-primary)] mb-6">
                        💬 Conversación con IA
                    </h2>
                    <p className="text-[var(--color-secondary)] mb-8 text-lg">
                        Elige un tema y empieza a practicar tu español con correcciones en tiempo real.
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {['Cafetería', 'Aeropuerto', 'Restaurante', 'Hotel', 'Trabajo', 'Hobbies'].map(topic => (
                             <button
                                key={topic}
                                onClick={() => {
                                    const sessionId = `session_${Date.now()}`;
                                    const safeTopic = encodeURIComponent(topic);
                                    const safeLevel = encodeURIComponent(nivel);
                                    navigate(`/chat/${safeTopic}/${safeLevel}/${sessionId}`);
                                }}
                                className="bg-white border border-gray-200 p-6 rounded-[var(--radius-btn)] hover:border-slate-600 hover:bg-slate-600 hover:text-white transition-all shadow-sm font-medium text-lg"
                             >
                                {topic}
                             </button>
                        ))}
                         <button
                                onClick={startConversation}
                                className="col-span-1 sm:col-span-2 bg-[var(--color-accent)] text-white p-6 rounded-[var(--radius-btn)] hover:opacity-90 transition-all shadow-md font-bold text-lg"
                             >
                                ✨ Tema General / Libre
                             </button>
                    </div>
                </div>
            )}
          </Suspense>
        )}
      </main>
    </div>
  );
};

export default HomePage;
