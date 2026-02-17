import type { Meta, StoryObj } from '@storybook/react';
import Sidebar from '../components/Sidebar';
import { MemoryRouter } from 'react-router-dom';

const meta = {
  title: 'Layout/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="h-screen bg-[#F9F9FB] flex">
        <div className="relative">
             <Story />
        </div>
        <div className="ml-64 p-8 text-gray-600">
            (Main Content Area Placeholder)
        </div>
      </div>
    ),
    (Story) => (
        <MemoryRouter initialEntries={['/']}>
            <Story />
        </MemoryRouter>
    )
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Desktop: Story = {};
