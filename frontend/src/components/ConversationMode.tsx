import React, { useState, useEffect, useRef } from "react";
import GrammarReport from "./GrammarReport";
import { ThinkingIndicator } from "./ThinkingIndicator";
import { ChatMessage } from "../types/chat";
import { useUserStats } from "../hooks/useUserStats";
import { useAuth } from "../hooks/useAuth";

/**
 * Props for the ConversationMode component.
 */
interface Props {
  /** The topic for the conversation (e.g., "At the airport"). */
  topic: string;
  /** The difficulty level ("Beginner", "Intermediate", "Advanced"). */
  level: string;
  /** Callback to return to the previous screen. */
  onBack: () => void;
}

/**
 * The main chat interface for the AI Tutor.
 * 
 * Features:
 * - Real-time chat with `ConversationService`.
 * - Automatic topic generation if none provided.
 * - Grammar analysis feedback upon ending the session.
 * - "Thinking" indicator states.
 * - Suggestion chips for user replies.
 * 
 * @param props - {@link Props}
 */
const ConversationMode: React.FC<Props> = ({ topic: initialTopic, level, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { addXP } = useUserStats();
  const { user } = useAuth(); // Get authenticated user
  const [showReport, setShowReport] = useState<boolean>(false);
  const [grammarReport, setGrammarReport] = useState<any>(null);
  const [showTopicSelector, setShowTopicSelector] = useState<boolean>(false);
  const [newTopic, setNewTopic] = useState<string>("");
  
  // New State for Suggestions
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const [currentTopic, setCurrentTopic] = useState<string>(initialTopic);
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => 
    Math.random().toString(36).substring(7)
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fetchingRef = useRef<boolean>(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, suggestions]); // Scroll when messages or suggestions update

  useEffect(() => {
    const startChat = async () => {
      if (fetchingRef.current || !user) return; // Wait for user to be available
      fetchingRef.current = true;
      setIsLoading(true);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 35000);

      try {
        const res = await fetch("/api/chat/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            topic: currentTopic, 
            level, 
            sessionId: currentSessionId,
            uid: user.uid // Send UID
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          if (res.status === 429 || errorData.code === 'rate_limit_exceeded') {
             throw new Error("LIMITE_CUOTA");
          }
          throw new Error("ERROR_SERVIDOR");
        }

        const data = await res.json();
        const messageData = typeof data.message === 'string' 
          ? { text: data.message, gender: 'female', suggestions: [] } 
          : data.message;

        if (messageData.model) {
          console.log(`🤖 AI Model: ${messageData.model}`);
        }

        const { text, gender, suggestions: newSuggestions } = messageData;
        setMessages([{ role: "ai", content: text }]);
        setSuggestions(newSuggestions || []);

      } catch (error: any) {
        console.error("Chat Error:", error);
        let errorMsg = "Hubo un problema al conectar con el tutor.";
        
        if (error.name === 'AbortError') {
           errorMsg = "El tutor está tardando mucho en responder. Por favor, recarga la página.";
        } else if (error.message === "LIMITE_CUOTA") {
          errorMsg = "⚠️ Has alcanzado el límite de mensajes gratuitos por hoy (200/día). Por favor, intenta de nuevo mañana o añade crédito a tu cuenta de OpenAI.";
        }
        
        setMessages([{ role: "ai", content: errorMsg }]);
      } finally {
        clearTimeout(timeoutId);
        setIsLoading(false);
        setTimeout(() => { fetchingRef.current = false; }, 1000);
      }
    };

    startChat();
  }, [currentTopic, level, currentSessionId, user]); // Add user to deps

  const handleSend = async (e?: React.FormEvent, forcedText?: string) => {
    e?.preventDefault();
    const userMsg = forcedText || input;

    if (!userMsg.trim() || isLoading || !user) return;

    // Clear suggestions immediately after sending
    setSuggestions([]);
    setInput("");
    
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 35000);

    try {
      const res = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMsg, 
          sessionId: currentSessionId, 
          topic: currentTopic, 
          level,
          uid: user.uid // Send UID
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        if (res.status === 429) throw new Error("LIMITE_CUOTA");
        throw new Error("ERROR_ENVIO");
      }

      const data = await res.json();
      const { text, gender, correction, suggestions: nextSuggestions, model } = data.message;

      if (model) {
        console.log(`🤖 AI Model: ${model}`);
      }

      setMessages((prev) => {
        const newMessages = [...prev, { role: "ai", content: text } as ChatMessage];
        
        if (correction) {
          newMessages.push({ 
            role: "ai", 
            content: `💡 Sugerencia: ${correction}`,
          });
        }
        return newMessages;
      });
      
      setSuggestions(nextSuggestions || []);

    } catch (error: any) {
      let errorMsg = "No pude enviarte la respuesta.";

      if (error.name === 'AbortError') {
         errorMsg = "El tutor está tardando mucho en responder. Intenta de nuevo.";
      } else if (error instanceof Error && error.message === "LIMITE_CUOTA") {
        errorMsg = "⚠️ Límite de mensajes alcanzado. No puedo responder más por hoy.";
      }
      setMessages(prev => [...prev, { role: "ai", content: errorMsg }]);
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (msg: string) => {
      handleSend(undefined, msg);
  };

  const handleNewCustomConversation = () => {
    if (!newTopic.trim()) return;
    setMessages([]);
    setSuggestions([]);
    setCurrentTopic(newTopic);
    setCurrentSessionId(Math.random().toString(36).substring(7));
    setNewTopic("");
    setShowTopicSelector(false);
  };

  const handleEndConversation = async () => {
    setIsLoading(true);
    try {
      const userMessages = messages
        .filter(m => m.role === 'user')
        .map(m => m.content)
        .join("\n");

      if (!userMessages) {
         setGrammarReport(null);
         setShowReport(true);
         return;
      }

      const res = await fetch("/api/grammar/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text: userMessages, 
          context: `Topic: ${currentTopic}, Level: ${level}` 
        }),
      });

      if (!res.ok) throw new Error("Failed to analyze grammar");

      const report = await res.json();
      setGrammarReport(report);
      setShowReport(true);
      
      const earnedXP = typeof report.score === 'number' ? Math.round(report.score) : 10;
      if (earnedXP > 0) {
        addXP(earnedXP);
      }

    } catch (error) {
      console.error("Error ending conversation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (showTopicSelector) {
    return (
      <div 
        className="max-w-2xl mx-auto p-4"
        onKeyDown={(e) => {
            if (e.key === 'Escape') setShowTopicSelector(false);
        }}
      >
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">✨ Crear Conversación Personalizada</h3>
          <p className="text-gray-600 mb-4">Introduce un tema para practicar. La IA creará un escenario basado en lo que escribas.</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tema de la conversación
              </label>
              <input
                type="text"
                value={newTopic}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTopic(e.target.value)}
                placeholder="Ej: 'Pedir comida en un restaurante', 'Hablar de mis hobbies'..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && handleNewCustomConversation()}
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowTopicSelector(false)} className="px-4 py-2 bg-gray-500 text-white rounded-lg">
                Cancelar
              </button>
              <button 
                onClick={handleNewCustomConversation}
                disabled={!newTopic.trim() || isLoading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {isLoading ? "Iniciando..." : "Empezar Conversación"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showReport && grammarReport) {
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <button 
          onClick={() => { setShowReport(false); onBack(); }}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition"
        >
          ← Volver al inicio
        </button>
        <GrammarReport report={grammarReport} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] max-w-2xl mx-auto glass-panel rounded-[var(--radius-card)] overflow-hidden">
      {/* Header */}
        <div className="flex bg-slate-100/90 backdrop-blur-md p-4 text-slate-800 justify-between items-center border-b border-gray-200 pb-4 pt-4 sticky top-0 z-10">
            <button 
                onClick={onBack} 
                className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-slate-600 px-4 py-2 rounded-[var(--radius-btn)] transition-all mr-4 font-medium tracking-wide shadow-sm hover:shadow"
                title="Salir de la conversación"
                aria-label="Salir de la conversación y volver al menú principal"
            >
                <span className="text-lg">⬅️</span>
                <span className="uppercase text-xs font-bold">Salir</span>
            </button>
            <div className="flex-1">
                <h2 className="font-display font-bold text-xl tracking-wide truncate text-slate-800">{currentTopic}</h2>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Nivel: {level}</span>
            </div>
            <div className="flex gap-2">
                <button onClick={() => setShowTopicSelector(true)} className="text-xs bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-[var(--radius-btn)] font-bold transition tracking-wide shadow-sm hidden sm:block">
                    ✨ Nuevo Tema
                </button>
          <button 
            onClick={handleEndConversation}
            disabled={isLoading}
            className="text-xs bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 px-4 py-2 rounded-[var(--radius-btn)] transition disabled:opacity-50 tracking-wide font-bold shadow-sm"
          >
            {isLoading ? "Analizando..." : "Finalizar"}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] p-5 shadow-sm transition-all ${
              msg.role === "user"
                ? "bg-slate-600 text-white rounded-2xl rounded-br-sm shadow-md"
                : "bg-white border border-gray-100 text-[var(--color-primary)] rounded-2xl rounded-bl-sm"
            }`}>
              <p className={msg.role === "user" ? "font-sans leading-relaxed" : "font-serif text-lg leading-relaxed"}>
                  {msg.content}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
               <ThinkingIndicator />
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* SUGGESTIONS PILLS */}
      {suggestions.length > 0 && !isLoading && (
        <div className="px-6 py-4 bg-white/50 border-t border-gray-100 backdrop-blur-sm flex flex-wrap gap-2">
            {suggestions.map((s, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleSuggestionClick(s)}
                  className="bg-white border border-[var(--color-accent)]/30 text-[var(--color-primary)] rounded-full px-5 py-2 text-sm hover:bg-[var(--color-accent)]/10 transition shadow-sm hover:shadow-md text-left font-medium"
                >
                  ✨ {s}
                </button>
            ))}
        </div>
      )}

      <form onSubmit={(e) => handleSend(e)} className="p-4 border-t border-gray-200 bg-white/80 backdrop-blur-md flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
          placeholder="Escribe tu respuesta en español..."
          className="flex-1 border border-gray-200 bg-gray-50 rounded-[var(--radius-btn)] px-5 py-3 focus:outline-none focus:ring-1 focus:ring-slate-400 transition"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-slate-700 text-white px-8 py-3 rounded-[var(--radius-btn)] hover:bg-slate-800 disabled:opacity-50 font-bold tracking-wide transition shadow-lg"
        >
          ENVIAR
        </button>
      </form>
    </div>
  );
};

export default ConversationMode;