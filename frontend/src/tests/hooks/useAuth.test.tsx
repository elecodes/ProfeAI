import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuth } from '../../hooks/useAuth';
import { AuthContext } from '../../config/AuthContext';
import * as firebase from '../../config/firebase';
import UserService from '../../services/UserService';
import React from 'react';

// Mock dependencies
vi.mock('../../config/firebase', () => ({
  emailLogin: vi.fn(),
  emailSignup: vi.fn(),
  googleLogin: vi.fn(),
  logout: vi.fn(),
  resetPassword: vi.fn(),
  setAuthPersistence: vi.fn(),
}));

vi.mock('../../services/UserService', () => ({
  default: {
    createUserProfile: vi.fn(),
    getUserProfile: vi.fn(),
  },
}));

describe('useAuth', () => {
  const mockContextValue = {
    user: null,
    userProfile: null,
    loading: false,
    error: null,
    setError: vi.fn(),
    setLoading: vi.fn(),
    setUserProfile: vi.fn(),
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthContext.Provider value={mockContextValue as any}>
      {children}
    </AuthContext.Provider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws error if used outside AuthProvider', () => {
    // console.error is expected here as Vitest catches the error
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useAuth())).toThrow('useAuth must be used within an AuthProvider');
    spy.mockRestore();
  });

  it('provides the context values', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.user).toBe(null);
    expect(result.current.loading).toBe(false);
  });

  describe('signIn', () => {
    it('calls firebase emailLogin with correct parameters', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      const email = 'test@example.com';
      const password = 'password123';
      
      vi.mocked(firebase.emailLogin).mockResolvedValue({ user: { uid: '123' } } as any);
      
      await act(async () => {
        await result.current.signIn(email, password, true);
      });

      expect(firebase.setAuthPersistence).toHaveBeenCalledWith(true);
      expect(firebase.emailLogin).toHaveBeenCalledWith(email, password);
      expect(mockContextValue.setLoading).toHaveBeenCalledWith(true);
      expect(mockContextValue.setLoading).toHaveBeenCalledWith(false);
    });

    it('sets error if fields are missing', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await act(async () => {
        await result.current.signIn('', '');
      });

      expect(mockContextValue.setError).toHaveBeenCalledWith('Email y contraseña son obligatorios.');
    });

    it('handles sign in errors', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      const error = new Error('Invalid credentials');
      vi.mocked(firebase.emailLogin).mockRejectedValue(error);
      
      await expect(act(async () => {
        await result.current.signIn('test@example.com', 'wrong');
      })).rejects.toThrow('Invalid credentials');

      await waitFor(() => {
        expect(mockContextValue.setError).toHaveBeenCalledWith('Invalid credentials');
      });
    });
  });

  describe('signUp', () => {
    it('creates user profile on success', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      const mockUser = { uid: 'new-user' };
      vi.mocked(firebase.emailSignup).mockResolvedValue({ user: mockUser } as any);
      
      await act(async () => {
        await result.current.signUp('new@example.com', 'password123');
      });

      expect(firebase.emailSignup).toHaveBeenCalled();
      expect(UserService.createUserProfile).toHaveBeenCalledWith(mockUser);
    });
  });

  describe('signOut', () => {
    it('calls firebase logout', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      await act(async () => {
        await result.current.signOut();
      });

      expect(firebase.logout).toHaveBeenCalled();
    });
  });
});
