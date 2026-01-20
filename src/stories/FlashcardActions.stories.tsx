import type { Meta, StoryObj } from '@storybook/react';
import FlashcardActions from '../components/FlashcardActions';
import { useState } from 'react';

const meta = {
  title: 'Components/FlashcardActions',
  component: FlashcardActions,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    showTranslation: { control: 'boolean' },
    learned: { control: 'boolean' },
    onLearned: { action: 'learned' },
  },
} satisfies Meta<typeof FlashcardActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    showTranslation: false,
    learned: false,
    setShowTranslation: () => {},
    setLearned: () => {},
  },
};

export const Interactive = {
  render: (args: any) => {
    const [showTranslation, setShowTranslation] = useState(false);
    const [learned, setLearned] = useState(false);

    return (
      <FlashcardActions
        {...args}
        showTranslation={showTranslation}
        setShowTranslation={setShowTranslation}
        learned={learned}
        setLearned={setLearned}
      />
    );
  },
};
