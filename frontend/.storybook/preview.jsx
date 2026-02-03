/** @type { import('@storybook/react-vite').Preview } */
import '../src/index.css';
import { AuthProvider } from '../src/config/AuthContext';
import React from 'react';

const preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo"
    }
  },
  decorators: [
    // eslint-disable-next-line no-unused-vars
    (Story) => (
      <AuthProvider>
        <Story />
      </AuthProvider>
    ),
  ],
};

export default preview;