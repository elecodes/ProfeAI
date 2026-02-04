# ADR 007: Automated Content Update Strategy

## Context
The ProfeAI application requires fresh lesson content every 14 days to keep users engaged. This content is generated using Google Gemini AI and stored in Firestore. Initial implementations faced two main challenges:
1.  **Deployment Path Errors**: GitHub Actions failed because script and credential paths didn't align with the monorepo structure.
2.  **Quota Constraints**: On the Gemini free tier, `gemini-2.0-flash` often hits "Per Minute" rate limits (429 errors) and is restricted to specific models.

## Decision
We implemented a robust update script (`backend/scripts/refresh-content.ts`) with the following characteristics:

1.  **Path Resilience**: The script correctly handles monorepo paths and service account credentials, working both locally and within GitHub Actions.
2.  **Smart Model Fallback**: The script attempts to use the primary model (`gemini-2.0-flash`) and falls back to a lite version (`gemini-2.0-flash-lite`) if needed. It avoids non-standard aliases that return 404s for certain API keys.
3.  **Aggressive Backoff**: To survive "Per Minute" quotas on free tiers, we implemented a sequence of long delays (45s, 90s, 120s) between retry attempts.
4.  **GitHub Action Automation**: A scheduled workflow (`.github/workflows/auto-update-lessons.yml`) ensures this runs every 14 days or on manual demand.

## Consequences
*   **Reliability**: The script has a significantly higher success rate even under strict quota environments.
*   **Execution Time**: The script may take several minutes to complete due to the deliberate backoff periods. This is an acceptable trade-off for a background cron task.
*   **Maintenance**: Developers should periodically check that the models used in `modelsToTry` are still available and not deprecated by Google.
