import { useState } from "react";

export const useTTS = () => {
  const [audio, setAudio] = useState(null);
  const [currentProvider, setCurrentProvider] = useState(null);

  const speakWithWebSpeech = (text, lang = "es", options = {}) => {
    return new Promise((resolve, reject) => {
      if (!window.speechSynthesis) {
        reject(new Error("Web Speech API not supported"));
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();

      const isMale = options?.gender === "male";
      const langCode = lang.startsWith("es") ? "es" : "en";

      const preferredVoice =
        voices.find((voice) => {
          const name = voice.name.toLowerCase();
          const langMatch = voice.lang.startsWith(langCode);
          if (!langMatch) return false;

          if (isMale) {
            return (
              name.includes("pablo") ||
              name.includes("david") ||
              name.includes("enrique") ||
              name.includes("male") ||
              name.includes("guy")
            );
          }
          return (
            name.includes("helena") ||
            name.includes("laura") ||
            name.includes("female") ||
            name.includes("google español")
          );
        }) || voices.find((v) => v.lang.startsWith(langCode));

      if (preferredVoice) {
        utterance.voice = preferredVoice;
        console.log(`🎤 Browser Voice: ${preferredVoice.name}`);
      }

      utterance.lang = lang === "es" ? "es-ES" : "en-US";
      utterance.rate = 0.95;
      utterance.onend = () => resolve();
      utterance.onerror = (e) => reject(e);

      window.speechSynthesis.speak(utterance);
      setCurrentProvider("webspeech");
    });
  };

  const speak = async (text, lang = "es", options = {}) => {
    try {
      if (window.currentAudio) {
        window.currentAudio.pause();
        window.currentAudio = null;
      }

      try {
        console.log("🎙️ Attempting backend TTS...");
        const response = await fetch("http://localhost:3001/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            language: lang,
            options: options || {},
          }),
        });

        if (response.ok) {
          const provider = response.headers.get("X-TTS-Provider") || "unknown";
          const arrayBuffer = await response.arrayBuffer();
          const audioBlob = new Blob([arrayBuffer], { type: "audio/mpeg" });
          const audioURL = URL.createObjectURL(audioBlob);
          const newAudio = new Audio(audioURL);

          // ACTUALIZACIÓN DE ESTADO INMEDIATA
          setCurrentProvider(provider);
          setAudio(newAudio);
          window.currentAudio = newAudio;

          // Reproducción asíncrona (no bloqueante)
          newAudio
            .play()
            .catch((err) => console.error("Error playing audio:", err));

          newAudio.onended = () => {
            URL.revokeObjectURL(audioURL);
          };

          console.log(`✅ TTS successful using ${provider}`);
          return; // Salimos exitosamente
        } else {
          console.warn("⚠️ Backend TTS failed. Status:", response.status);
        }
      } catch (fetchError) {
        console.warn("⚠️ Backend unreachable:", fetchError.message);
      }

      // FALLBACK
      await speakWithWebSpeech(text, lang, options);
      console.log("✅ Using Web Speech API fallback");
    } catch (err) {
      console.error("❌ All TTS methods failed:", err);
      setCurrentProvider("failed");
    }
  };

  return { speak, audio, currentProvider };
};
