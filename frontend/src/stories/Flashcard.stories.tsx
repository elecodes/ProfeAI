import type { Meta, StoryObj } from '@storybook/react';
import { Flashcard } from '../components/Flashcard';

const meta = {
  title: 'Components/Flashcard',
  component: Flashcard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    text: { control: 'text' },
    translation: { control: 'text' },
    onMarkLearned: { action: 'learned' },
    onSpeak: { action: 'speak' },
  },
} satisfies Meta<typeof Flashcard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    text: 'Hello',
    translation: 'Hola',
    onSpeak: () => {},
    onMarkLearned: () => {},
  },
};

export const LongText: Story = {
  args: {
    text: 'The quick brown fox jumps over the lazy dog',
    translation: 'El veloz zorro marrón salta sobre el perro perezoso',
    onSpeak: () => {},
    onMarkLearned: () => {},
  },
};
