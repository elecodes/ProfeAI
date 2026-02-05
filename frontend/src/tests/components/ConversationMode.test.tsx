import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ConversationMode from '../../components/ConversationMode';
import { useAuth } from '../../hooks/useAuth';
import { useUserStats } from '../../hooks/useUserStats';


// Mock dependencies
vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../hooks/useUserStats', () => ({
  useUserStats: vi.fn(),
}));

// Mock GrammarReport
vi.mock('../../components/GrammarReport', () => ({
  default: () => <div data-testid="grammar-report">Mocked Grammar Report</div>,
}));

// Mock ThinkingIndicator
vi.mock('../../components/ThinkingIndicator', () => ({
  ThinkingIndicator: () => <div data-testid="thinking-indicator">AI is thinking...</div>,
}));

// Mock ScrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('ConversationMode', () => {
  const mockOnBack = vi.fn();
  const mockUser = { uid: 'test-uid' };
  const mockAddXP = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({ user: mockUser, loading: false });
    (useUserStats as any).mockReturnValue({ addXP: mockAddXP });
    
    // Mock global fetch
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url === '/api/chat/start') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            message: {
              text: 'Hello! I am your tutor.',
              suggestions: ['Hi!', 'How are you?']
            }
          })
        });
      }
      if (url === '/api/chat/message') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            message: {
              text: 'That is interesting!',
              suggestions: ['Tell me more', 'Next topic']
            }
          })
        });
      }
      if (url === '/api/grammar/analyze') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            score: 85,
            corrections: []
          })
        });
      }
      return Promise.reject(new Error('Unknown URL'));
    });
  });

  it('renders correctly and starts a conversation', async () => {
    render(<ConversationMode topic="Travel" level="B1" onBack={mockOnBack} />);
    
    // Initial loading state or component header
    expect(screen.getByText(/Travel/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Hello! I am your tutor.')).toBeInTheDocument();
      expect(screen.getByText('✨ Hi!')).toBeInTheDocument();
    });
  });

  it('sends a message and receives reply', async () => {
    render(<ConversationMode topic="Travel" level="B1" onBack={mockOnBack} />);
    
    await waitFor(() => expect(screen.getByPlaceholderText(/Escribe en español/i)).toBeInTheDocument());
    
    const input = screen.getByPlaceholderText(/Escribe en español/i);
    fireEvent.change(input, { target: { value: 'I love traveling.' } });
    fireEvent.click(screen.getByText(/ENVIAR/i));

    await waitFor(() => {
      expect(screen.getByText('That is interesting!')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/chat/message', expect.anything());
  });

  it('ends conversation and shows grammar report', async () => {
    render(<ConversationMode topic="Travel" level="B1" onBack={mockOnBack} />);
    
    await waitFor(() => expect(screen.getByText(/Finalizar/i)).toBeInTheDocument());
    
    // Send a message first so there is content to analyze
    const input = screen.getByPlaceholderText(/Escribe en español/i);
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.click(screen.getByText(/ENVIAR/i));
    await waitFor(() => expect(screen.getByText('That is interesting!')).toBeInTheDocument());

    fireEvent.click(screen.getByText(/Finalizar/i));
    
    await waitFor(() => {
      expect(screen.getByTestId('grammar-report')).toBeInTheDocument();
    });
    
    expect(mockAddXP).toHaveBeenCalledWith(85);
  });

  it('calls onBack when back button is clicked', () => {
    render(<ConversationMode topic="Travel" level="B1" onBack={mockOnBack} />);
    
    const backBtn = screen.getByLabelText(/Salir de la conversación/i);
    fireEvent.click(backBtn);
    
    expect(mockOnBack).toHaveBeenCalled();
  });
});
