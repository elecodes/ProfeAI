# 003. Gemini Fallback Strategy & Auth Security

**Date:** 2026-01-22
**Status:** Accepted

## Context

### Dialogue Generation
The application previously used a hardcoded OpenAI implementation for generating dialogues. This was failing (HTTP 500) because the project is configured for Google Gemini via Genkit. Additionally, Genkit's Gemini models (specifically `flash-lite-001`) are prone to aggressive rate limiting (429 errors) on the free tier.

### Authentication UX/Security
The login and registration forms lacked specific feedback.
- Users trying to login without an account received generic "Login failed" errors.
- Registration passwords had no visible strength requirements, leading to frustration when valid policies were enforced silently.

## Decision

### 1. Gemini Fallback Strategy (Genkit)
We migrated `DialogueGenerator` to use **Google Gemini** via Genkit's `ai.defineFlow`. To mitigate rate limits, we implemented a **Racing & Fallback Strategy** directly in `src/lib/genkit.ts`:

1.  **Primary Attempt**: Try **Gemini 2.0 Flash Lite** (Fastest, Lowest Cost).
2.  **Fallback**: If Primary fails (e.g., 429 Rate Limit), catch the error and automatically try **Gemini 1.5 Flash** (Stable).
3.  **Last Resort**: The system throws a structured error if both fail.

This ensures high availability without requiring the user to manually retry.

### 2. Enhanced Authentication UX
We updated `SignInForm.tsx` and `SignUpForm.tsx` (the active components):

-   **SignIn**: specifically catches `auth/user-not-found` and `auth/invalid-credential` to display: *"Account not found. Please register first."*
-   **Password Recovery**: Added a "Did you forget your password?" link (currently a UI placeholder for future implementation).
-   **SignUp**: Added a real-time **visual checklist** for password requirements (8+ chars, Uppercase, Number, Special Char) to improve user guidance.

## Consequences

### Positive
-   **Reliability**: Dialogue generation is robust against single-model outages or rate limits.
-   **Cost**: Prioritizes the cheaper/free "Lite" model before using the heavier 1.5 Flash.
-   **UX**: Users have clear guidance on login failures and password creation, reducing support friction.
-   **Consistency**: The backend now correctly uses the project's configured AI provider (Gemini).

### Negative
-   **Complexity**: `genkit.ts` now contains imperative fallback logic.
-   **Latency**: The fallback mechanism introduces a delay (latency of Model A + Model B) when the primary model fails.
