import { useState } from "react";

export const useTTS = () => {
  const [audio, setAudio] = useState(null);
  const [currentProvider, setCurrentProvider] = useState(null);

  /**
   * Fallback to Web Speech API (browser native TTS)
   */
  const speakWithWebSpeech = (text, lang = "es", options = {}) => {
    return new Promise((resolve, reject) => {
      if (!window.speechSynthesis) {
        reject(new Error("Web Speech API not supported in this browser"));
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();

      // Lógica de género
      

     const isMale = options.gender === "male";
     const langCode = lang.startsWith("es") ? "es" : "en";

     const preferredVoice =
       voices.find((voice) => {
         const name = voice.name.toLowerCase();
         const langMatch = voice.lang.startsWith(langCode);

         if (isMale && langMatch) {
           // Buscamos nombres de voces masculinas comunes en sistemas
           return (
             name.includes("pablo") ||
             name.includes("david") ||
             name.includes("male") ||
             name.includes("enrique") ||
             name.includes("guy")
           );
         }
         if (!isMale && langMatch) {
           return (
             name.includes("helena") ||
             name.includes("laura") ||
             name.includes("female") ||
             name.includes("google español")
           );
         }
         return false;
       }) || voices.find((voice) => voice.lang.startsWith(langCode));

      if (preferredVoice) {
        utterance.voice = preferredVoice;
        console.log(
          `🎤 Using voice: ${preferredVoice.name} (${preferredVoice.lang})`
        );
      }

      utterance.lang = lang === "es" ? "es-ES" : "en-US";
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onend = () => {
        console.log("✅ Web Speech API completed");
        resolve();
      };

      utterance.onerror = (event) => {
        console.error("❌ Web Speech API error:", event.error);
        reject(new Error(`Web Speech API error: ${event.error}`));
      };

      window.speechSynthesis.speak(utterance);
      setCurrentProvider("webspeech");
    });
  };

  /**
   * Main speak function with automatic fallback
   */
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
          body: JSON.stringify({ text, language: lang, options }),
        });

        if (response.ok) {
          const provider = response.headers.get("X-TTS-Provider") || "unknown";
          const arrayBuffer = await response.arrayBuffer();
          const audioBlob = new Blob([arrayBuffer], { type: "audio/mpeg" });
          const audioURL = URL.createObjectURL(audioBlob);
          const newAudio = new Audio(audioURL);
          
          window.currentAudio = newAudio;
          setCurrentProvider(provider);
          setAudio(newAudio);

          await new Promise((resolve, reject) => {
            newAudio.onended = () => {
              URL.revokeObjectURL(audioURL);
              resolve();
            };
            newAudio.onerror = (err) => {
              URL.revokeObjectURL(audioURL);
              reject(err);
            };

            const playPromise = newAudio.play();
            if (playPromise !== undefined) {
              playPromise.catch((err) => {
                URL.revokeObjectURL(audioURL);
                reject(err);
              });
            }
          });
          
          console.log(`✅ TTS successful using ${provider} (high quality)`);
          return;
        } else {
          console.warn("⚠️ Backend TTS failed. Status:", response.status);
        }
      } catch (fetchError) {
        console.warn("⚠️ Backend unreachable or error during playback:", fetchError.message);
      }

      // IMPORTANTE: Aquí pasamos 'options' para que el género llegue al fallback
      await speakWithWebSpeech(text, lang, options);
      console.log("✅ Using Web Speech API fallback");
    } catch (err) {
      console.error("❌ All TTS methods failed:", err);
      setCurrentProvider("failed");
    }
  };

  return { speak, audio, currentProvider };
};
