import type { Meta, StoryObj } from '@storybook/react';
import ConversationMode from '../components/ConversationMode';
import React, { useEffect } from 'react';

// Mock Decorator for Chat
const MockChatDecorator = (Story: React.ComponentType) => {
  useEffect(() => {
    const originalFetch = window.fetch;
    
    window.fetch = async (url: RequestInfo | URL, options?: RequestInit) => {
      const urlStr = url.toString();
      
      // 1. Mock Start Chat
      if (urlStr.includes('/api/chat/start')) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
          ok: true,
          json: async () => ({
            message: {
                text: "¡Hola! Soy tu tutor de IA. ¿De qué te gustaría hablar hoy?",
                gender: 'female',
                suggestions: ["Hablar de viajes", "Practicar comida", "Deportes"]
            }
          }),
        } as Response;
      }

      // 2. Mock Message
      if (urlStr.includes('/api/chat/message')) {
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
        const body = options?.body ? JSON.parse(options.body as string) : {};
        
        return {
          ok: true,
          json: async () => ({
            message: {
                text: `Interesante que digas "${body.message}". ¿Podrías contarme más sobre eso?`,
                gender: 'female',
                correction: body.message.length < 5 ? "Intenta decir una frase más completa." : null,
                suggestions: ["Claro, te cuento...", "Prefiero cambiar de tema"]
            }
          }),
        } as Response;
      }

      // 3. Mock Grammar Analysis
      if (urlStr.includes('/api/grammar/analyze')) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return {
            ok: true,
            json: async () => ({
                score: 88,
                generalFeedback: "Good conversation! You maintained the flow well.",
                corrections: [
                    { original: "Mock error", corrected: "Mock correction", type: "spelling", explanation: "This is a simulated correction." }
                ]
            })
        } as Response;
      }

      return originalFetch(url, options);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return <Story />;
};

const meta = {
  title: 'Components/ConversationMode',
  component: ConversationMode,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  decorators: [MockChatDecorator],
  argTypes: {
    onBack: { action: 'back' },
    level: { control: 'select', options: ['A1', 'A2', 'B1', 'B2'] },
    topic: { control: 'text' }
  },
} satisfies Meta<typeof ConversationMode>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    topic: 'Viajes',
    level: 'A1',
  },
};
