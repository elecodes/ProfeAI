import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProfilePage from '../../pages/ProfilePage';

// Mock dependencies
const mockSignOut = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { uid: '123' },
    signOut: mockSignOut
  })
}));

vi.mock('../../hooks/useUserStats', () => ({
  useUserStats: () => ({
    stats: { xp: 100, level: 'beginner', username: 'TestUser' },
    updateProfile: vi.fn(),
    resetStats: vi.fn()
  })
}));

vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  Link: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useNavigate: () => mockNavigate
}));

describe('ProfilePage', () => {
  it('renders logout button', () => {
    render(<ProfilePage />);
    expect(screen.getByText(/cerrar sesión/i)).toBeInTheDocument();
  });

  it('calls signOut and navigates on logout click', async () => {
    render(<ProfilePage />);
    const logoutBtn = screen.getByText(/cerrar sesión/i);
    fireEvent.click(logoutBtn);
    expect(mockSignOut).toHaveBeenCalled();
    // wait for async helper
    await new Promise(process.nextTick); 
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});
