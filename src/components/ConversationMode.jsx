import React, { useState, useEffect, useRef } from "react";
import GrammarReport from "./GrammarReport";
import { useTTS } from "./hooks/useTTS"; 

const ConversationMode = ({ topic: initialTopic, level, onBack }) => {
  const { speak } = useTTS(); 
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [grammarReport, setGrammarReport] = useState(null);
  const [showTopicSelector, setShowTopicSelector] = useState(false);
  const [newTopic, setNewTopic] = useState("");
  
  const [currentTopic, setCurrentTopic] = useState(initialTopic);
  const [currentSessionId, setCurrentSessionId] = useState(() => 
    Math.random().toString(36).substring(7)
  );

  const messagesEndRef = useRef(null);
  const fetchingRef = useRef(false);

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

      try {
        const res = await fetch("http://localhost:3001/api/chat/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            topic: currentTopic, 
            level, 
            sessionId: currentSessionId 
          }),
        });

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
        speak(text, "es", { gender });

      } catch (error) {
        console.error("Chat Error:", error);
        let errorMsg = "Hubo un problema al conectar con el tutor.";
        
        if (error.message === "LIMITE_CUOTA") {
          errorMsg = "⚠️ Has alcanzado el límite de mensajes gratuitos por hoy (200/día). Por favor, intenta de nuevo mañana o añade crédito a tu cuenta de OpenAI.";
        }
        
        setMessages([{ role: "ai", content: errorMsg }]);
      } finally {
        setIsLoading(false);
        setTimeout(() => { fetchingRef.current = false; }, 1000);
      }
    };

    startChat();
  }, [currentTopic, level, currentSessionId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:3001/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: userMsg, 
          sessionId: currentSessionId, 
          topic: currentTopic, 
          level 
        }),
      });

      if (!res.ok) {
        if (res.status === 429) throw new Error("LIMITE_CUOTA");
        throw new Error("ERROR_ENVIO");
      }

      const data = await res.json();
      const { text, gender } = data.message;

      setMessages((prev) => [...prev, { role: "ai", content: text }]);
      speak(text, "es", { gender });

    } catch (error) {
      let errorMsg = "No pude enviarte la respuesta.";
      if (error.message === "LIMITE_CUOTA") {
        errorMsg = "⚠️ Límite de mensajes alcanzado. No puedo responder más por hoy.";
      }
      setMessages(prev => [...prev, { role: "ai", content: errorMsg }]);
    } finally {
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
                onChange={(e) => setNewTopic(e.target.value)}
                placeholder="Ej: 'Pedir comida en un restaurante', 'Hablar de mis hobbies'..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                onKeyDown={(e) => e.key === 'Enter' && handleNewCustomConversation()}
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
          <button onClick={() => setShowReport(true)} className="text-xs bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-md transition">
            Finalizar
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
          onChange={(e) => setInput(e.target.value)}
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