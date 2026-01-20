import type { Meta, StoryObj } from '@storybook/react';
import GrammarReport from '../components/GrammarReport';

const meta = {
  title: 'Components/GrammarReport',
  component: GrammarReport,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    report: { control: 'object' },
  },
} satisfies Meta<typeof GrammarReport>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleReport = {
  score: 85,
  generalFeedback: "Great job! You made a few minor mistakes but your message was clear.",
  corrections: [
    {
      original: "I has a cat",
      corrected: "I have a cat",
      type: "grammar",
      explanation: "Use 'have' for first person singular.",
    },
    {
      original: "She go to school",
      corrected: "She goes to school",
      type: "verb-conjugation",
      explanation: "Third person singular needs 'es' adding to 'go'.",
    }
  ]
};

export const WithResults: Story = {
  args: {
    report: sampleReport,
  },
};

export const PerfectScore: Story = {
  args: {
    report: {
      score: 100,
      generalFeedback: "Excellent work! Your grammar was flawless.",
      corrections: []
    },
  },
};

export const Empty: Story = {
  args: {
    report: null,
  },
};
