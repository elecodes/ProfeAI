import { useCallback } from "react";

export function useTTS() {
  const speak = useCallback(async (text, lang = "es") => {
    try {
      if (window.currentAudio) {
        window.currentAudio.pause();
        window.currentAudio = null;
      }

      const response = await fetch("http://localhost:3001/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language: lang }),
      });

      if (!response.ok) throw new Error("Audio generation failed");

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
  }, []);

  return { speak };
}
