export interface TTSOptions {
  gender?: 'male' | 'female';
  forceWebSpeech?: boolean;
  webSpeechVoiceIndex?: number;
  voiceId?: string;
  provider?: string;
  speed?: number;
}

export interface ManualVoiceConfig {
  male: number | string | null;
  female: number | string | null;
}

export interface UseTTSReturn {
  speak: (text: string, lang?: string, options?: TTSOptions) => Promise<void>;
  audio: HTMLAudioElement | null;
  currentProvider: string | null;
  listAvailableVoices: () => void;
  testAllVoices: (sampleText?: string) => void;
  VoiceDebugger: React.FC;
  manualVoiceConfig: ManualVoiceConfig;
  setVoiceConfig: (gender: 'male' | 'female', identifier: number | string) => void;
  stop: () => void;
  debugVoiceSelection: (gender: string) => void;
  speakWithVoiceIndex: (text: string, voiceIndex: number, lang?: string, options?: any) => Promise<void>;
  resetVoiceConfig: () => void;
  showCurrentConfig: () => void;
  setupNaturalVoices: () => void;
}
