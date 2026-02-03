import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from "@sentry/react";
import './index.css'
import App from './App'

/**
 * Application Entry Point.
 * 
 * - Initializes Sentry for error tracking (if enabled via env).
 * - Mounts the React application into the DOM root.
 * - Wraps App in StrictMode and Sentry ErrorBoundary.
 */

const enableSentry = import.meta.env.VITE_ENABLE_SENTRY === 'true';

if (enableSentry) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    // Tracing
    tracesSampleRate: 1.0, 
    // Session Replay
    replaysSessionSampleRate: 0.1, 
    replaysOnErrorSampleRate: 1.0, 
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error("Failed to find the root element");
}
const root = createRoot(rootElement);

import { AuthProvider } from './config/AuthContext'

const app = enableSentry ? (
  <Sentry.ErrorBoundary fallback={<div className="p-4 text-red-500">Ha ocurrido un error inesperado. Por favor recarga la página.</div>}>
    <AuthProvider>
      <App />
    </AuthProvider>
  </Sentry.ErrorBoundary>
) : (
  <AuthProvider>
    <App />
  </AuthProvider>
);

/**
 * Render the app.
 */
root.render(
  <StrictMode>
    {app}
  </StrictMode>,
)
