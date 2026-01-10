import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    ViteImageOptimizer({
      /* pass your config */
      png: { quality: 80 },
      jpeg: { quality: 80 },
      webp: { quality: 80 },
      svg: {
        multipass: true,
        plugins: [
          {
            name: 'preset-default',
            params: {
              overrides: {
                cleanupNumericValues: false,
              },
            },
          },
          'sortAttrs',
          {
            name: 'addAttributesToSVGElement',
            params: {
              attributes: [{ xmlns: 'http://www.w3.org/2000/svg' }],
            },
          },
        ],
      },
    }),
  ],
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: "./test/setup.js",
    include: [
      "src/tests/**/*.test.{js,jsx,ts,tsx}",
      "src/tests/**/integration/**/*.integration.test.{js,jsx,ts,tsx}",
    ],
  },
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:3001',
      '/tts': 'http://127.0.0.1:3001',
    },
  },
});
