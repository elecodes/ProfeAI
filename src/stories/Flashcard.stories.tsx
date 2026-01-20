import type { Meta, StoryObj } from '@storybook/react';
import Flashcard from '../components/Flashcard';

const meta = {
  title: 'Components/Flashcard',
  component: Flashcard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    english: { control: 'text' },
    spanish: { control: 'text' },
    onLearned: { action: 'learned' },
  },
} satisfies Meta<typeof Flashcard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    english: 'Hello',
    spanish: 'Hola',
  },
};

export const LongText: Story = {
  args: {
    english: 'The quick brown fox jumps over the lazy dog',
    spanish: 'El veloz zorro marrón salta sobre el perro perezoso',
  },
};
