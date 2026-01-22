/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from "@tailwindcss/vite";
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

// https://vite.dev/config/
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [react(), tailwindcss(), ViteImageOptimizer({
    /* pass your config */
    png: {
      quality: 80
    },
    jpeg: {
      quality: 80
    },
    webp: {
      quality: 80
    },
    svg: {
      multipass: true,
      plugins: [{
        name: 'preset-default',
        params: {
          overrides: {
            cleanupNumericValues: false
          }
        }
      }, 'sortAttrs', {
        name: 'addAttributesToSVGElement',
        params: {
          attributes: [{
            xmlns: 'http://www.w3.org/2000/svg'
          }]
        }
      }]
    }
  })],
  test: {
    environment: "happy-dom",
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/storybook-static/**',
        '**/.{idea,git,cache,output,temp}/**',
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
        'src/types/**',
        'src/config/**',
        'src/schemas/**',
        'src/vite-env.d.ts',
        'src/main.tsx',
        'src/App.tsx',
        '**/*.d.ts',
        'src/stories/**',
        '**/*.stories.{js,jsx,ts,tsx}',
        'test/**'
      ],
      thresholds: {
        global: { statements: 50, branches: 50, functions: 50, lines: 50 },
        'src/services/**': { statements: 100, branches: 100, functions: 100, lines: 100 },
        'src/lib/**': { statements: 100, branches: 100, functions: 100, lines: 100 },
        'src/utils/**': { statements: 100, branches: 100, functions: 100, lines: 100 }
      }
    },
    setupFiles: "./test/setup.js",
    include: ["src/tests/**/*.test.{js,jsx,ts,tsx}", "src/tests/**/integration/**/*.integration.test.{js,jsx,ts,tsx}"],
    projects: [
    {
      name: 'unit',
      extends: true,
      test: {
        include: ["src/tests/**/*.test.{js,jsx,ts,tsx}", "src/tests/**/integration/**/*.integration.test.{js,jsx,ts,tsx}"],
      }
    },
    {
      extends: true,
      plugins: [
      // The plugin will run tests for the stories defined in your Storybook config
      // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
      storybookTest({
        configDir: path.join(dirname, '.storybook')
      })],
      test: {
        name: 'storybook',
        browser: {
          enabled: true,
          headless: true,
          provider: playwright({}),
          instances: [{
            browser: 'chromium'
          }]
        },
        setupFiles: ['.storybook/vitest.setup.js']
      }
    }]
  },
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:3001',
      '/tts': 'http://127.0.0.1:3001'
    }
  }
});