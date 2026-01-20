import type { Meta, StoryObj } from '@storybook/react';
import DialogueGenerator from '../components/DialogueGenerator';
import React, { useEffect } from 'react';

// Mock Decorator
const MockApiDecorator = (Story: React.ComponentType) => {
  useEffect(() => {
    const originalFetch = window.fetch;
    
    window.fetch = async (url: RequestInfo | URL, options?: RequestInit) => {
      // Mock generate-dialogue
      if (url.toString().includes('generate-dialogue')) {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Fake delay
        
        // Check if we should error (hacky way to test errors via topic name)
        const body = options?.body ? JSON.parse(options.body as string) : {};
        if (body.topic === 'error') {
            return {
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
                json: async () => ({ message: 'Failed to generate' })
            } as Response;
        }

        return {
          ok: true,
          json: async () => ({
            title: "Shopping for Shoes",
            level: "A1",
            characters: [
              { name: "Maria", role: "Customer" },
              { name: "Juan", role: "Shop Assistant" }
            ],
            lines: [
              { character: "Juan", text: "Hola, ¿en qué puedo ayudarle?", translation: "Hello, how can I help you?" },
              { character: "Maria", text: "Busco unos zapatos negros.", translation: "I am looking for black shoes." }
            ]
          }),
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
  title: 'Components/DialogueGenerator',
  component: DialogueGenerator,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [MockApiDecorator],
  argTypes: {
    onGenerate: { action: 'generated' },
    level: { control: 'select', options: ['A1', 'A2', 'B1', 'B2'] }
  },
} satisfies Meta<typeof DialogueGenerator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    level: 'A1',
  },
};
