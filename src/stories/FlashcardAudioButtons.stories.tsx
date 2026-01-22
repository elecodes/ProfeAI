import type { Meta, StoryObj } from '@storybook/react';
import FlashcardAudioButtons from '../components/FlashcardAudioButtons';

const meta = {
  title: 'Components/FlashcardAudioButtons',
  component: FlashcardAudioButtons,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    english: { control: 'text' },
    spanish: { control: 'text' },
    speak: { action: 'speak' },
  },
} satisfies Meta<typeof FlashcardAudioButtons>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    english: 'Hello',
    spanish: 'Hola',
    speak: () => {}, // Mock function to satisfy required prop
  },
};
