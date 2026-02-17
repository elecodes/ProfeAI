import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  {
    ignores: ['**/dist/**', '**/storybook-static/**', '**/docs/**', '**/node_modules/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx,cjs,mjs}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { 
        varsIgnorePattern: '^[A-Z_]',
        argsIgnorePattern: '^_',
      }],
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/ban-ts-comment': 'off',
      'no-undef': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'prefer-const': 'warn',
    },
  },
  {
    files: [
      '**/*.test.{js,jsx,ts,tsx}', 
      '**/*.spec.{js,jsx,ts,tsx}',
      'test/**/*.js', 
      'server*.js', 
      'test-*.js', 
      'src/config/agents.js', 
      'src/services/TTSService.js',
      'playwright.config.js',
      'vite.config.js',
      '**/*.cjs',
      '**/*.mjs'
    ],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      'no-unused-vars': 'warn',
    }
  },
)
