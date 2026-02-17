import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTTS } from '../../../components/hooks/useTTS';
import UserService from '../../../services/UserService';
import React from 'react';

// Mock dependencies
vi.stubGlobal('fetch', vi.fn());
vi.mock('../../../hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { uid: 'test-uid' },
    userProfile: { preferences: { voice: null } },
  })),
}));

vi.mock('../../../services/UserService', () => ({
  default: {
    updateUserProgress: vi.fn(),
  },
}));

// Mock Audio
global.Audio = vi.fn().mockImplementation(() => ({
  play: vi.fn().mockResolvedValue(undefined),
  pause: vi.fn(),
  onended: null,
  src: '',
})) as any;

// Mock Web Speech API
const mockVoices = [
  { name: 'Google español', lang: 'es-ES', default: false },
  { name: 'Google US English', lang: 'en-US', default: true },
  { name: 'Monica', lang: 'es-ES', default: false },
  { name: 'Jorge', lang: 'es-ES', default: false },
];

(global as any).speechSynthesis = {
  getVoices: vi.fn(() => mockVoices),
  speak: vi.fn((utterance) => {
    if (utterance.onend) setTimeout(utterance.onend, 0);
  }),
  cancel: vi.fn(),
  onvoiceschanged: null,
};

global.SpeechSynthesisUtterance = class {
  text: string;
  lang: string = 'es-ES';
  onend: any = null;
  onerror: any = null;
  voice: any = null;
  rate: number = 1;
  pitch: number = 1;
  volume: number = 1;
  constructor(text: string) {
    this.text = text;
  }
} as any;

describe('useTTS Exhaustive', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (window as any).currentAudio = null;
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useTTS());
    expect(result.current.currentProvider).toBe(null);
  });

  describe('setVoiceConfig', () => {
    it('updates manual voice config and persists to UserService', async () => {
      const { result } = renderHook(() => useTTS());
      
      await act(async () => {
        result.current.setVoiceConfig('male', 'Google español');
      });

      expect(UserService.updateUserProgress).toHaveBeenCalledWith(
        'test-uid',
        expect.objectContaining({
          preferences: expect.objectContaining({
            voice: { gender: 'male', voiceId: 'Google español' }
          })
        })
      );
    });
  });

  describe('resetVoiceConfig', () => {
    it('resets config', async () => {
      const { result } = renderHook(() => useTTS());
      await act(async () => {
        result.current.resetVoiceConfig();
      });
      // Should not throw, verification through showCurrentConfig
      const spy = vi.spyOn(console, 'log');
      result.current.showCurrentConfig();
      expect(spy).toHaveBeenCalledWith('📋 Current voice configuration:', { male: null, female: null });
      spy.mockRestore();
    });
  });

  describe('speakWithVoiceIndex', () => {
    it('speaks using a forced index', async () => {
      const { result } = renderHook(() => useTTS());
      
      await act(async () => {
        await result.current.speakWithVoiceIndex('Hola', 0);
      });

      expect(global.speechSynthesis.speak).toHaveBeenCalled();
      expect(result.current.currentProvider).toBe('webspeech');
    });

    it('rejects if index is out of range', async () => {
      const { result } = renderHook(() => useTTS());
      
      await expect(act(async () => {
        await result.current.speakWithVoiceIndex('Hola', 99);
      })).rejects.toThrow(/out of range/);
    });
  });

  describe('stop', () => {
    it('cancels speech and pauses audio', () => {
      const mockAudio = { pause: vi.fn() };
      (window as any).currentAudio = mockAudio;
      
      const { result } = renderHook(() => useTTS());
      
      act(() => {
        result.current.stop();
      });

      expect(global.speechSynthesis.cancel).toHaveBeenCalled();
      expect(mockAudio.pause).toHaveBeenCalled();
    });
  });

  describe('speak branches', () => {
    it('uses Web Speech directly for male voices', async () => {
      const { result } = renderHook(() => useTTS());
      
      await act(async () => {
        await result.current.speak('Hola', 'es', { gender: 'male' });
      });

      expect(global.speechSynthesis.speak).toHaveBeenCalled();
      // Should NOT call fetch for male voices (special case in useTTS.tsx:590)
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('uses Web Speech when forceWebSpeech is true', async () => {
      const { result } = renderHook(() => useTTS());
      
      await act(async () => {
        await result.current.speak('Hola', 'es', { forceWebSpeech: true });
      });

      expect(global.speechSynthesis.speak).toHaveBeenCalled();
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('voice selection logic', () => {
    it('selects best male voice (Google español) automatically', async () => {
      const { result } = renderHook(() => useTTS());
      
      await act(async () => {
        await result.current.speak('Hola', 'es', { gender: 'male' });
      });

      expect(global.speechSynthesis.speak).toHaveBeenCalledWith(
        expect.objectContaining({
          voice: expect.objectContaining({ name: 'Google español' })
        })
      );
    });
  });
});
