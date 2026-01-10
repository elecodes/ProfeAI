import React, { useState, useEffect, useRef } from "react";
import GrammarReport from "./GrammarReport";
import { ChatMessage } from "../types/chat";

interface Props {
  topic: string;
  level: string;
  onBack: () => void;
}

const ConversationMode: React.FC<Props> = ({ topic: initialTopic, level, onBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showReport, setShowReport] = useState<boolean>(false);
  const [grammarReport, setGrammarReport] = useState<any>(null);
  const [showTopicSelector, setShowTopicSelector] = useState<boolean>(false);
  const [newTopic, setNewTopic] = useState<string>("");
  
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
  }, [messages]);

  useEffect(() => {
    const startChat = async () => {
      if (fetchingRef.current) return;
      fetchingRef.current = true;
      setIsLoading(true);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      try {
        const res = await fetch("/api/chat/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            topic: currentTopic, 
            level, 
            sessionId: currentSessionId 
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // DETECCIÓN MEJORADA DEL LÍMITE DE CUOTA (ERROR 429)
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          if (res.status === 429 || errorData.code === 'rate_limit_exceeded') {
             throw new Error("LIMITE_CUOTA");
          }
          throw new Error("ERROR_SERVIDOR");
        }

        const data = await res.json();
        const messageData = typeof data.message === 'string' 
          ? { text: data.message, gender: 'female' } 
          : data.message;

        const { text, gender } = messageData;
        setMessages([{ role: "ai", content: text }]);
        
        // Text only mode
        // setTimeout(() => {
        //   speak(text, "es", { gender, forceWebSpeech: true });
        // }, 50);

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
  }, [currentTopic, level, currentSessionId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const res = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMsg, 
          sessionId: currentSessionId, 
          topic: currentTopic, 
          level 
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        if (res.status === 429) throw new Error("LIMITE_CUOTA");
        throw new Error("ERROR_ENVIO");
      }

      const data = await res.json();
      const { text, gender, correction } = data.message;

      setMessages((prev) => {
        const newMessages = [...prev, { role: "ai", content: text } as ChatMessage];
        
        if (correction) {
          newMessages.push({ 
            role: "ai", 
            content: `💡 Sugerencia: ${correction}`,
            // We might need to handle this special styling in the render loop if ChatMessage type supports it, 
            // or just rely on the content prefix for now if the type is strict.
            // Assuming ChatMessage is { role: 'user' | 'ai', content: string }.
            // If we want special styling, we can prefix with emoji or HTML if supported, 
            // but for now keeping it simple as requested.
          });
        }
        return newMessages;
      });
      
      // Text only mode
      // setTimeout(() => {
      //   speak(text, "es", { gender, forceWebSpeech: true });
      // }, 50);

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

  const handleNewCustomConversation = () => {
    if (!newTopic.trim()) return;
    setMessages([]);
    setCurrentTopic(newTopic);
    setCurrentSessionId(Math.random().toString(36).substring(7));
    setNewTopic("");
    setShowTopicSelector(false);
  };

  const handleEndConversation = async () => {
    setIsLoading(true);
    try {
      // 1. Collect all user messages
      const userMessages = messages
        .filter(m => m.role === 'user')
        .map(m => m.content)
        .join("\n");

      if (!userMessages) {
        // If no messages, just show empty report or close
         setGrammarReport(null);
         setShowReport(true);
         return;
      }

      // 2. Call API for analysis
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

    } catch (error) {
      console.error("Error ending conversation:", error);
      // Fallback or error state
    } finally {
      setIsLoading(false);
    }
  };

  // --- INTERFAZ TRADUCIDA AL ESPAÑOL ---

  if (showTopicSelector) {
    return (
      <div className="max-w-2xl mx-auto p-4">
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
    <div className="flex flex-col h-[600px] max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      <div className="bg-indigo-600 p-4 text-white flex justify-between items-center shadow-md">
        <div>
          <h2 className="font-bold text-lg">{currentTopic}</h2>
          <span className="text-xs opacity-80 uppercase tracking-wider">Nivel: {level}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowTopicSelector(true)} className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-md font-medium transition">
            ✨ Nuevo Tema
          </button>
          <button 
            onClick={handleEndConversation}
            disabled={isLoading}
            className="text-xs bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-md transition disabled:opacity-50"
          >
            {isLoading ? "Analizando..." : "Finalizar"}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl p-3.5 shadow-sm ${
              msg.role === "user"
                ? "bg-indigo-600 text-white rounded-br-none"
                : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex gap-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t bg-white flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
          placeholder="Escribe tu respuesta en español..."
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-50 font-medium"
        >
          Enviar
        </button>
      </form>
    </div>
  );
};

export default ConversationMode;