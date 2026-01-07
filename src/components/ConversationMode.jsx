import React, { useState, useEffect, useRef } from "react";
import GrammarReport from "./GrammarReport";
import { useTTS } from "./hooks/useTTS"; // 1. Importar el hook

const ConversationMode = ({ topic, level, onBack }) => {
  const { speak } = useTTS(); // 2. Inicializar TTS
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => Math.random().toString(36).substring(7));
  const [showReport, setShowReport] = useState(false);
  const [grammarReport, setGrammarReport] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Start conversation
  useEffect(() => {
    const startChat = async () => {
      setIsLoading(true);
      try {
        const res = await fetch("http://localhost:3001/api/chat/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic, level, sessionId }),
        });
        const data = await res.json();

        // 3. Ahora data.message es un objeto { text, gender }
        const { text, gender } = data.message;

        setMessages([{ role: "ai", content: text }]);

        // Reproducir voz inicial
        speak(text, "es", { gender });
      } catch (error) {
        console.error("Failed to start chat", error);
        setMessages([{ role: "ai", content: "Error starting conversation." }]);
      } finally {
        setIsLoading(false);
      }
    };
    startChat();
  }, [topic, level, sessionId, speak]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:3001/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, sessionId, topic, level }),
      });
      const data = await res.json();

      // 4. Extraer texto y género de la respuesta de la IA
      const { text, gender } = data.message;

      setMessages((prev) => [...prev, { role: "ai", content: text }]);

      // 5. Hablar con la voz correcta (Juan o Ana según el JSON)
      speak(text, "es", { gender });
    } catch (error) {
      console.error("Failed to send message", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndSession = async () => {
    setIsLoading(true);
    // Aggregate user messages for analysis
    const userText = messages
      .filter((m) => m.role === "user")
      .map((m) => m.content)
      .join("\n");

    if (!userText) {
      setShowReport(true); // Show empty report or just exit
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/api/grammar/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: userText,
          context: `Conversation about ${topic} at ${level} level`,
        }),
      });
      const report = await res.json();
      setGrammarReport(report);
      setShowReport(true);
    } catch (error) {
      console.error("Failed to analyze grammar", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (showReport) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <button
          onClick={() => setShowReport(false)}
          className="mb-4 text-blue-600 hover:underline"
        >
          ← Back to Chat
        </button>
        <GrammarReport report={grammarReport} />
        <div className="mt-6 text-center">
          <button
            onClick={onBack}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Exit Conversation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] max-w-2xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-indigo-600 p-4 text-white flex justify-between items-center">
        <div>
          <h2 className="font-bold text-lg">{topic}</h2>
          <span className="text-xs opacity-80">{level} Roleplay</span>
        </div>
        <button
          onClick={handleEndSession}
          className="text-xs bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
        >
          End Session
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-br-none"
                  : "bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 rounded-lg p-3 animate-pulse">...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t bg-white flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ConversationMode;
