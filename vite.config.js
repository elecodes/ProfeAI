import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: "./test/setup.js",
    include: [
      "src/tests/**/*.test.{js,jsx}",
      "src/tests/**/integration/**/*.integration.test.{js,jsx}",
    ],
  },
});
