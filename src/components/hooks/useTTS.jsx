import { useState, useEffect } from "react";

export const useTTS = () => {
  const [audio, setAudio] = useState(null);
  const [currentProvider, setCurrentProvider] = useState(null);

  // Manual voice configuration - can be set by user
  const [manualVoiceConfig, setManualVoiceConfig] = useState({
    male: null, // voice index or name
    female: null // voice index or name
  });

  // Debug function to list available voices
  const listAvailableVoices = () => {
    if (window.speechSynthesis) {
      const voices = window.speechSynthesis.getVoices();
      console.log("🎤 Available voices:");
      voices.forEach(voice => {
        console.log(`  - ${voice.name} (${voice.lang}) [${voice.default ? 'default' : 'available'}]`);
      });
    }
  };

  // Debug function to test voice selection for specific gender
  const debugVoiceSelection = (gender) => {
    if (window.speechSynthesis) {
      const voices = window.speechSynthesis.getVoices();
      const isMale = gender === "male";
      const langCode = "es";

      console.log(`🔍 Debugging voice selection for ${gender} voices:`);
      console.log(`Total voices available: ${voices.length}`);

      // Find all Spanish voices
      const spanishVoices = voices.filter(v => v.lang.startsWith(langCode));
      console.log(`Spanish voices: ${spanishVoices.length}`);
      spanishVoices.forEach(voice => {
        console.log(`  - ${voice.name} (${voice.lang})`);
      });

      // Test the selection logic
      const preferredVoice = (() => {
        // First, try to find premium/enhanced voices that match the desired gender
        const genderSpecificPremiumVoice = voices.find((voice) => {
          const name = voice.name.toLowerCase();
          const langMatch = voice.lang.startsWith(langCode);
          if (!langMatch) return false;

          const isPremium = (
            name.includes("premium") ||
            name.includes("enhanced") ||
            name.includes("google") ||
            name.includes("microsoft") ||
            name.includes("neural")
          );

          if (!isPremium) return false;

          // Check if this premium voice matches the desired gender
          if (isMale) {
            return (
              name.includes("male") ||
              name.includes("guy") ||
              name.includes("hombre") ||
              name.includes("man") ||
              name.includes("carlos") ||
              name.includes("jorge") ||
              name.includes("pablo") ||
              name.includes("david") ||
              name.includes("enrique")
            );
          } else {
            return (
              name.includes("female") ||
              name.includes("mujer") ||
              name.includes("woman") ||
              name.includes("helena") ||
              name.includes("laura") ||
              name.includes("ana") ||
              name.includes("maria") ||
              name.includes("carmen")
            );
          }
        });

        if (genderSpecificPremiumVoice) {
          console.log(`✅ Found gender-specific premium voice: ${genderSpecificPremiumVoice.name}`);
          return genderSpecificPremiumVoice;
        }

        // If no gender-specific premium voice, try any premium voice
        const anyPremiumVoice = voices.find((voice) => {
          const name = voice.name.toLowerCase();
          const langMatch = voice.lang.startsWith(langCode);
          if (!langMatch) return false;

          return (
            name.includes("premium") ||
            name.includes("enhanced") ||
            name.includes("google") ||
            name.includes("microsoft") ||
            name.includes("neural")
          );
        });

        if (anyPremiumVoice) {
          console.log(`⚠️ Using any premium voice: ${anyPremiumVoice.name}`);
          return anyPremiumVoice;
        }

        // Finally, look for gender-specific voices without premium requirement
        const genderVoice = voices.find((voice) => {
          const name = voice.name.toLowerCase();
          const langMatch = voice.lang.startsWith(langCode);
          if (!langMatch) return false;

          if (isMale) {
            return (
              name.includes("pablo") ||
              name.includes("david") ||
              name.includes("enrique") ||
              name.includes("jorge") ||
              name.includes("carlos") ||
              name.includes("male") ||
              name.includes("guy") ||
              name.includes("hombre") ||
              name.includes("man")
            );
          }
          return (
            name.includes("helena") ||
            name.includes("laura") ||
            name.includes("ana") ||
            name.includes("maria") ||
            name.includes("carmen") ||
            name.includes("female") ||
            name.includes("mujer") ||
            name.includes("woman") ||
            name.includes("google español")
          );
        });

        // PRIORITY: Avoid robotic Google voices - look for natural voices first
        const naturalNonGoogleVoice = voices.find((voice) => {
          const name = voice.name.toLowerCase();
          const langMatch = voice.lang.startsWith(langCode);
          if (!langMatch) return false;

          // Explicitly avoid Google voices that sound robotic
          if (name.includes("google")) {
            return false;
          }

          // Look for any non-Google Spanish voice
          return true;
        });

        if (naturalNonGoogleVoice) {
          console.log(`🎯 Using natural non-Google voice: ${naturalNonGoogleVoice.name}`);
          return naturalNonGoogleVoice;
        }

        // Last resort: any Spanish voice (including Google if nothing else works)
        const anySpanishVoice = voices.find((v) => v.lang.startsWith(langCode));
        if (anySpanishVoice) {
          console.log(`⚠️ Using any Spanish voice (may be robotic): ${anySpanishVoice.name}`);
          return anySpanishVoice;
        }

        console.log(`❌ No Spanish voice found`);
        return null;
      })();

      console.log(`🎯 Final selected voice: ${preferredVoice?.name || 'none'}`);
    }
  };

  // Function to test all available voices with sample text
  const testAllVoices = (sampleText = "Hola, soy una voz de prueba.") => {
    if (window.speechSynthesis) {
      const voices = window.speechSynthesis.getVoices();
      console.log(`🎤 Testing all ${voices.length} available voices with: "${sampleText}"`);

      voices.forEach((voice, index) => {
        setTimeout(() => {
          console.log(`🔊 Testing voice ${index + 1}/${voices.length}: ${voice.name} (${voice.lang})`);
          const utterance = new SpeechSynthesisUtterance(sampleText);
          utterance.voice = voice;
          utterance.rate = 0.9;
          utterance.pitch = 1.0;
          utterance.volume = 0.7; // Lower volume for testing
          window.speechSynthesis.speak(utterance);
        }, index * 3000); // 3 second delay between each voice test
      });
    }
  };

  // Function to force use a specific voice by index
  const speakWithVoiceIndex = (text, voiceIndex, lang = "es", options = {}) => {
    return new Promise((resolve, reject) => {
      if (!window.speechSynthesis) {
        reject(new Error("Web Speech API not supported"));
        return;
      }

      const loadVoices = () => {
        let voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) {
          window.speechSynthesis.onvoiceschanged = () => {
            voices = window.speechSynthesis.getVoices();
            proceedWithIndex(voices);
          };
          setTimeout(() => {
            voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
              proceedWithIndex(voices);
            }
          }, 100);
        } else {
          proceedWithIndex(voices);
        }
      };

      const proceedWithIndex = (voices) => {
        if (voiceIndex < 0 || voiceIndex >= voices.length) {
          reject(new Error(`Voice index ${voiceIndex} out of range. Available: 0-${voices.length - 1}`));
          return;
        }

        const selectedVoice = voices[voiceIndex];
        console.log(`🎯 Force using voice ${voiceIndex}: ${selectedVoice.name} (${selectedVoice.lang})`);

        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = selectedVoice;
        utterance.lang = lang === "es" ? "es-ES" : "en-US";
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        utterance.onend = () => resolve();
        utterance.onerror = (e) => reject(e);

        window.speechSynthesis.speak(utterance);
        setCurrentProvider("webspeech");
      };

      loadVoices();
    });
  };

  // Function to manually set voice configuration
  const setVoiceConfig = (gender, voiceIdentifier) => {
    // voiceIdentifier can be a number (index) or string (name)
    setManualVoiceConfig(prev => ({
      ...prev,
      [gender]: voiceIdentifier
    }));
    console.log(`🎛️ Set ${gender} voice to: ${voiceIdentifier}`);
  };

  // Function to reset manual voice configuration
  const resetVoiceConfig = () => {
    setManualVoiceConfig({});
    console.log(`🔄 Reset all manual voice configurations`);
  };

  // Function to show current voice configuration
  const showCurrentConfig = () => {
    console.log(`📋 Current voice configuration:`, manualVoiceConfig);
    if (manualVoiceConfig.male) {
      console.log(`👨 Male voice config: ${manualVoiceConfig.male}`);
    }
    if (manualVoiceConfig.female) {
      console.log(`👩 Female voice config: ${manualVoiceConfig.female}`);
    }
    if (!manualVoiceConfig.male && !manualVoiceConfig.female) {
      console.log(`🔄 Using automatic voice selection (no manual config)`);
    }
  };

  // Quick setup function - only configure male voice to use Google español
  const setupNaturalVoices = () => {
    if (window.speechSynthesis) {
      const voices = window.speechSynthesis.getVoices();

      // Set male voice to Google español (index 195) as it sounds best
      if (voices[195] && voices[195].name.includes("Google español")) {
        setVoiceConfig('male', 195);
        console.log(`✅ Set male voice to: ${voices[195].name} (index 195) - BEST MALE VOICE!`);
      } else {
        console.log('⚠️ Google español voice not found at index 195');
      }

      console.log('🎉 Male voice configured! Juan will now use Google español - the best masculine voice!');
      console.log('👩 Female voices remain unchanged (they were already working perfectly).');
    }
  };

  const speakWithWebSpeech = (text, lang = "es", options = {}) => {
    return new Promise((resolve, reject) => {
      if (!window.speechSynthesis) {
        reject(new Error("Web Speech API not supported"));
        return;
      }

      // Ensure voices are loaded before proceeding
      const loadVoices = () => {
        let voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) {
          // If voices are not loaded yet, wait for them
          window.speechSynthesis.onvoiceschanged = () => {
            voices = window.speechSynthesis.getVoices();
            proceedWithVoices(voices);
          };
          // Also try after a short delay as fallback
          setTimeout(() => {
            voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
              proceedWithVoices(voices);
            }
          }, 100);
        } else {
          proceedWithVoices(voices);
        }
      };

      const proceedWithVoices = (voices) => {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);

        const isMale = options?.gender === "male";
        const langCode = lang.startsWith("es") ? "es" : "en";

        // SPECIAL CASE: If server specified a specific voice index
        if (options.webSpeechVoiceIndex !== undefined && voices[options.webSpeechVoiceIndex]) {
          const forcedVoice = voices[options.webSpeechVoiceIndex];
          console.log(`🎯 Using server-forced voice: ${forcedVoice.name} (index ${options.webSpeechVoiceIndex})`);
          utterance.voice = forcedVoice;
          utterance.rate = 0.8;
          utterance.pitch = 0.7;
          utterance.volume = 1.0;
          utterance.lang = lang === "es" ? "es-ES" : "en-US";
          utterance.onend = () => resolve();
          utterance.onerror = (e) => reject(e);
          window.speechSynthesis.speak(utterance);
          setCurrentProvider("webspeech");
          return;
        }

        const preferredVoice = (() => {

          // PRIORITY 0: Check manual configuration first
          if (manualVoiceConfig[isMale ? 'male' : 'female']) {
            const manualVoice = manualVoiceConfig[isMale ? 'male' : 'female'];
            console.log(`🎛️ Found manual config for ${isMale ? 'male' : 'female'}: ${manualVoice}`);
            if (typeof manualVoice === 'number' && manualVoice < voices.length) {
              console.log(`🎯 Using manually configured voice index ${manualVoice}: ${voices[manualVoice].name}`);
              return voices[manualVoice];
            } else if (typeof manualVoice === 'string') {
              const foundVoice = voices.find(v => v.name === manualVoice);
              if (foundVoice) {
                console.log(`🎯 Using manually configured voice: ${foundVoice.name}`);
                return foundVoice;
              }
            }
          }

          // SPECIAL CASE: For male voices, use Google español as it sounds best
          if (isMale) {
            // First try index 195 (where user found it works best)
            if (voices[195] && voices[195].name.includes("Google español")) {
              console.log(`🎯 Using best male voice: ${voices[195].name} (index 195)`);
              return voices[195];
            }

            // If not at 195, search for Google español by name
            const googleEspanolVoice = voices.find(v => v.name.includes("Google español") && v.lang.startsWith('es'));
            if (googleEspanolVoice) {
              const googleIndex = voices.indexOf(googleEspanolVoice);
              console.log(`🎯 Using best male voice: ${googleEspanolVoice.name} (index ${googleIndex})`);
              return googleEspanolVoice;
            }

            console.log(`⚠️ Google español voice not found. Available Spanish voices: ${voices.filter(v => v.lang.startsWith('es')).length}`);
          }

          // Get all Spanish voices
          const spanishVoices = voices.filter(v => v.lang.startsWith(langCode));
          console.log(`Available Spanish voices: ${spanishVoices.length}`);

          // PRIORITY 1: Look for natural-sounding voices (avoid robotic Google voices)
          const anyNaturalVoice = voices.find((voice) => {
            const name = voice.name.toLowerCase();
            const langMatch = voice.lang.startsWith(langCode);
            if (!langMatch) return false;

            // Avoid robotic Google voices that sound artificial
            if (name.includes("google español") || name.includes("google")) {
              return false;
            }

            // Look for natural-sounding voice names
            const naturalNames = [
              "eddy", "flo", "grandma", "grandpa", "monica", "paulina",
              "reed", "rocko", "sandy", "shelley", "carmen", "jorge",
              "luis", "pedro", "diego", "roberto", "antonio", "pablo",
              "david", "enrique", "carlos", "ana", "maria", "isabel",
              "rosa", "elena", "patricia", "beatriz", "raquel"
            ];

            return naturalNames.some(naturalName => name.includes(naturalName));
          });

          if (anyNaturalVoice) {
            console.log(`🎯 Using natural voice: ${anyNaturalVoice.name}`);
            return anyNaturalVoice;
          }

          // PRIORITY 2: Look for gender-specific natural voices
          const genderNaturalVoice = voices.find((voice) => {
            const name = voice.name.toLowerCase();
            const langMatch = voice.lang.startsWith(langCode);
            if (!langMatch) return false;

            // Avoid robotic Google voices
            if (name.includes("google español") || name.includes("google")) {
              return false;
            }

            if (isMale) {
              // Prioritize masculine-sounding natural voices
              const maleNaturalVoices = [
                "grandpa", "eddy", "rocko", "reed", "jorge", "carlos",
                "luis", "pedro", "diego", "roberto", "antonio", "pablo",
                "david", "enrique"
              ];
              return maleNaturalVoices.some(maleName => name.includes(maleName));
            } else {
              // Prioritize feminine-sounding natural voices
              const femaleNaturalVoices = [
                "grandma", "flo", "sandy", "shelley", "monica", "paulina",
                "carmen", "ana", "maria", "isabel", "rosa", "elena",
                "patricia", "beatriz", "raquel"
              ];
              return femaleNaturalVoices.some(femaleName => name.includes(femaleName));
            }
          });

          if (genderNaturalVoice) {
            console.log(`🎯 Using gender-specific natural voice: ${genderNaturalVoice.name}`);
            return genderNaturalVoice;
          }

          // PRIORITY 2: Look for natural-sounding voices (avoid robotic Google voices)
          if (anyNaturalVoice) {
            console.log(`🎯 Using natural voice: ${anyNaturalVoice.name}`);
            return anyNaturalVoice;
          }
          const fallbackNaturalVoice = voices.find((voice) => {
            const name = voice.name.toLowerCase();
            const langMatch = voice.lang.startsWith(langCode);
            if (!langMatch) return false;

            // Avoid robotic Google voices that sound artificial
            if (name.includes("google español") || name.includes("google")) {
              return false;
            }

            // Look for natural-sounding voice names
            const naturalNames = [
              "eddy", "flo", "grandma", "grandpa", "monica", "paulina",
              "reed", "rocko", "sandy", "shelley", "carmen", "jorge",
              "luis", "pedro", "diego", "roberto", "antonio", "pablo",
              "david", "enrique", "carlos", "ana", "maria", "isabel",
              "rosa", "elena", "patricia", "beatriz", "raquel"
            ];

            return naturalNames.some(naturalName => name.includes(naturalName));
          });

          if (fallbackNaturalVoice) {
            console.log(`🎯 Using fallback natural voice: ${fallbackNaturalVoice.name}`);
            return fallbackNaturalVoice;
          }

          if (genderSpecificPremiumVoice) {
            console.log(`✅ Found gender-specific premium voice: ${genderSpecificPremiumVoice.name}`);
            return genderSpecificPremiumVoice;
          }

          // PRIORITY 3: Use any premium voice if available (better quality)
          const anyPremiumVoice = voices.find((voice) => {
            const name = voice.name.toLowerCase();
            const langMatch = voice.lang.startsWith(langCode);
            if (!langMatch) return false;

            return (
              name.includes("premium") ||
              name.includes("enhanced") ||
              name.includes("google") ||
              name.includes("microsoft") ||
              name.includes("neural")
            );
          });

          if (anyPremiumVoice) {
            console.log(`⚠️ Using any premium voice (may not match gender): ${anyPremiumVoice.name}`);
            return anyPremiumVoice;
          }

          // PRIORITY 4: Use default Spanish voice as last resort
          const defaultSpanishVoice = voices.find((v) => v.lang.startsWith(langCode));
          if (defaultSpanishVoice) {
            console.log(`⚠️ Using default Spanish voice: ${defaultSpanishVoice.name}`);
            return defaultSpanishVoice;
          }

          console.log(`❌ No suitable voice found`);
          return null;
        })();

        if (preferredVoice) {
          utterance.voice = preferredVoice;
          console.log(`🎤 Browser Voice Selected: ${preferredVoice.name} (${preferredVoice.lang}) - Gender: ${isMale ? 'male' : 'female'}`);
        } else {
          console.log(`⚠️ No preferred voice found for ${isMale ? 'male' : 'female'}, using default`);
        }

        utterance.lang = lang === "es" ? "es-ES" : "en-US";

        // More aggressive gender differentiation
        if (isMale) {
          utterance.rate = 0.8; // Slower for male voices (more authoritative)
          utterance.pitch = 0.7; // Much lower pitch for male voices
          console.log(`👨 Male voice parameters: rate=${utterance.rate}, pitch=${utterance.pitch}`);
        } else {
          utterance.rate = 0.95; // Slightly faster for female voices
          utterance.pitch = 1.1; // Higher pitch for female voices
          console.log(`👩 Female voice parameters: rate=${utterance.rate}, pitch=${utterance.pitch}`);
        }

        utterance.volume = 1.0;
        utterance.onend = () => resolve();
        utterance.onerror = (e) => reject(e);

        window.speechSynthesis.speak(utterance);
        setCurrentProvider("webspeech");
      };

      loadVoices();
    });
  };

  const speak = async (text, lang = "es", options = {}) => {
    try {
      // Cancel any ongoing speech synthesis
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }

      if (window.currentAudio) {
        window.currentAudio.pause();
        window.currentAudio = null;
      }

      // SPECIAL CASE: Always use Web Speech API for male voices (they sound better)
      if (options?.gender === "male") {
        console.log("🎙️ Using Web Speech API directly for male voice (bypassing backend)");
        await speakWithWebSpeech(text, lang, options);
        return;
      }

      // SPECIAL CASE: If server forces Web Speech API
      if (options.forceWebSpeech) {
        console.log("🎙️ Server forced Web Speech API");
        await speakWithWebSpeech(text, lang, options);
        return;
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

  // Debug component for voice testing and configuration
  const VoiceDebugger = () => {
    const [voices, setVoices] = useState([]);
    const [testText, setTestText] = useState("Hola, soy Juan y quiero probar esta voz.");

    useEffect(() => {
      const updateVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;

      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }, []);

    const testVoice = (voiceIndex) => {
      if (voices[voiceIndex]) {
        speakWithVoiceIndex(testText, voiceIndex);
      }
    };

    const spanishVoices = voices.filter(v => v.lang.startsWith('es'));
    const naturalVoices = spanishVoices.filter(v => !v.name.toLowerCase().includes('google'));

    return (
      <div className="fixed top-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-md max-h-96 overflow-y-auto z-50">
        <h3 className="font-bold mb-2">🎤 Voice Debugger</h3>
        <div className="mb-2 text-xs text-green-600 bg-green-50 p-2 rounded">
          💡 <strong>Best Male Voice:</strong> Google español - Suena más masculino!
        </div>
        <div className="mb-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
          📋 <strong>Current Config:</strong>
          Male: {manualVoiceConfig.male ? `${manualVoiceConfig.male} (manual)` : 'auto (Google español)'}
          | Female: {manualVoiceConfig.female ? `${manualVoiceConfig.female} (manual)` : 'auto (original)'}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Test Text:</label>
          <input
            type="text"
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            className="w-full border rounded px-2 py-1 text-sm"
          />
        </div>

        <div className="mb-4">
          <h4 className="font-semibold mb-2 text-green-600">🌿 Natural Voices ({naturalVoices.length}):</h4>
          {naturalVoices.map((voice, index) => {
            const actualIndex = voices.indexOf(voice);
            return (
              <div key={actualIndex} className="flex items-center justify-between mb-1">
                <span className="text-sm">{voice.name}</span>
                <button
                  onClick={() => testVoice(actualIndex)}
                  className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                >
                  Test
                </button>
              </div>
            );
          })}
        </div>

        <div className="mb-4">
          <h4 className="font-semibold mb-2 text-red-600">🤖 Google Voices ({spanishVoices.length - naturalVoices.length}):</h4>
          {spanishVoices.filter(v => v.name.toLowerCase().includes('google')).map((voice, index) => {
            const actualIndex = voices.indexOf(voice);
            return (
              <div key={actualIndex} className="flex items-center justify-between mb-1">
                <span className="text-sm">{voice.name}</span>
                <button
                  onClick={() => testVoice(actualIndex)}
                  className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                >
                  Test
                </button>
              </div>
            );
          })}
        </div>

        <div className="mb-4">
          <h4 className="font-semibold mb-2">Quick Config:</h4>
          <div className="space-y-2">
            <div>
              <label className="text-sm">Male Voice Index: </label>
              <input
                type="number"
                min="0"
                max={voices.length - 1}
                onChange={(e) => setVoiceConfig('male', parseInt(e.target.value))}
                className="border rounded px-2 py-1 text-sm w-16"
                placeholder="Auto"
              />
              <button
                onClick={() => {
                  // Set male voice to Google español (best male voice)
                  if (voices[195] && voices[195].name.includes("Google español")) {
                    setVoiceConfig('male', 195);
                    alert(`Set male voice to: ${voices[195].name} (BEST MALE VOICE!)`);
                  } else {
                    alert('Google español voice not found at index 195');
                  }
                }}
                className="ml-2 bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
              >
                Best Male
              </button>
            </div>
            <div>
              <label className="text-sm">Female Voice Index: </label>
              <input
                type="number"
                min="0"
                max={voices.length - 1}
                onChange={(e) => setVoiceConfig('female', parseInt(e.target.value))}
                className="border rounded px-2 py-1 text-sm w-16"
                placeholder="Auto"
              />
              <button
                onClick={() => {
                  alert('Female voices are already working well! No changes needed.');
                }}
                className="ml-2 bg-pink-500 text-white px-2 py-1 rounded text-xs hover:bg-pink-600 opacity-50 cursor-not-allowed"
                disabled
              >
                Female OK ✓
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={() => debugVoiceSelection('male')}
          className="bg-green-500 text-white px-3 py-1 rounded text-sm mr-2 hover:bg-green-600"
        >
          Debug Male
        </button>
        <button
          onClick={() => debugVoiceSelection('female')}
          className="bg-purple-500 text-white px-3 py-1 rounded text-sm mr-2 hover:bg-purple-600"
        >
          Debug Female
        </button>
        <button
          onClick={() => setupNaturalVoices()}
          className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600"
        >
          👨 Setup Best Male Voice
        </button>
        <button
          onClick={() => resetVoiceConfig()}
          className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 ml-2"
        >
          🔄 Reset Config
        </button>
      </div>
    );
  };

  return {
    speak,
    audio,
    currentProvider,
    listAvailableVoices,
    debugVoiceSelection,
    testAllVoices,
    speakWithVoiceIndex,
    setVoiceConfig,
    resetVoiceConfig,
    showCurrentConfig,
    setupNaturalVoices,
    manualVoiceConfig,
    VoiceDebugger
  };
};
