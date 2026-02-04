# 🚒 Incident Response Playbook

> **Goal**: Minimize Mean Time To Recovery (MTTR). Target: **< 15 min** for critical incidents.

## 🧠 Philosophy: Runbook vs Playbook

*   **Runbook**: Routine operational procedures (e.g., "How to deploy", "How to backup DB"). Followed when things are *working*.
*   **Playbook**: Response to *incidents*. Focuses on diagnosis, mitigation, and recovery. Followed when things are *broken*.

## 📂 Arquitectura Monorepo
El proyecto está dividido en dos grandes bloques:
- **frontend/**: React + Vite + Tailwind.
- **backend/**: Node.js + Express + Genkit.

### Comandos de Emergencia (Raíz)
- `npm run dev`: Lanza ambos entornos a la vez.
- `npm run frontend:dev`: Solo la web.
- `npm run backend:dev`: Solo el servidor.

---

## 🔄 Incident Response Lifecycle

### 1. 🚨 Detect
*   **Source**: Sentry Alerts, Uptime Robot, User Reports.
*   **Action**: Acknowledge the alert.
*   **Severity Assessment**:
    *   **SEV-1 (Critical)**: System down, core feature (Dialogues/Auth) broken for all users. -> **Wake up On-Call**.
    *   **SEV-2 (Major)**: Core feature broken for some users, or performance degraded. -> **Fix ASAP**.
    *   **SEV-3 (Minor)**: Non-critical bug, cosmetic issue. -> **Next business day**.

### 2. 🔍 Diagnose
*   **Check Sentry**: Look for spikes in errors or specific transaction failures.
*   **Check Logs**: `docker-compose logs -f server` or Cloud logs.
*   **Reproduce**: Can you trigger it in Dev/Staging?
*   **Recent Changes**: Did a deployment just happen? (Check Git history).

### 3. 🛠️ Fix
*   **Mitigation First**: Stop the bleeding.
    *   **Rollback**: If a recent deploy caused it, revert immediately. `git revert` is faster than `git commit --fix`.
    *   **Feature Flag**: Disable the broken feature via env vars if possible.
*   **Fix Forward**: Only if the fix is obvious and trivial (one-line config change).
*   **Verify**: Ensure the fix works in Staging before Prod.

### 4. 📝 Document
*   **Post-Mortem**: Required for all SEV-1.
*   **Root Cause Analysis (RCA)**: Why did it happen? (5 Whys).
*   **Action Items**: Prevent recurrence (add test, improve monitoring).

---

## 📈 Escalation Path

**When to escalate to On-Call Engineer?**
1.  **SEV-1 Confirmed**: System is down.
2.  **Unknown Root Cause > 15 min**: You've tried diagnosing for 15 mins and have no clue.
3.  **Fix is Risky**: You know the fix but it involves dangerous DB operations.

---

## 📖 Specific Playbooks

### Scenario A: High Error Rate (HTTP 500s)
**Trigger**: Sentry alert "Error rate > 5%".

1.  **Check Sentry Issues**: Is it one specific error?
    *   *Yes*: Fix that specific bug.
    *   *No (Generic)*: Check Server Resources (CPU/RAM).
2.  **Check Database**: Is the DB reachable?
3.  **Rollback**: If started after deploy, revert to `HEAD^`.

### Scenario B: Third-Party API Failure (OpenAI / Google / ElevenLabs)
**Trigger**: `TTSService` or `DialogueGenerator` errors.

1.  **Check Status Pages**:
    *   [OpenAI Status](https://status.openai.com/)
    *   [Google Cloud Status](https://status.cloud.google.com/)
    *   [ElevenLabs Status](https://status.elevenlabs.io/)
2.  **Model Fallback & Logs**:
    *   The system uses **"Sequential Fallback"** (trying Gemini 2.5 Flash Lite first, then 2.5 Flash, then 1.5).
    *   Check server logs for `🤖 AI Model:` or `🚀 Racing model:` to see the attempt history.

### Scenario G: CSP Violations (Security Policy)
**Trigger**: Browser console red errors "Refused to load... violates Content Security Policy".

1.  **Identify Source**: Note the blocked URL (e.g., `apis.google.com`).
2.  **Update Config**:
    *   **Backend**: Add domain to `server.ts` (Helmet config).
    *   **Frontend**: Add domain to `index.html` (Meta tag) for local Dev.
3.  **Restart**: Backend changes (`server.ts`) REQUIRE a server restart (`npm start`). Frontend changes just need a refresh.

### Scenario C: Frontend Assets 404
**Trigger**: White screen, "Loading chunk failed".

1.  **Clear Cache**: User browser cache might be stale.
2.  **Verify Build**: Did `npm run build` complete successfully?
3.  **Check Docker**: Are static files being served correctly? (`docker-compose restart server`).

### Scenario D: High Rate of 429 Errors (Quota Exceeded)
**Trigger**: Sentry alert "Rate limit exceeded" or user reports of "LIMITE_CUOTA".

1.  **Check Provider**: Is it our `express-rate-limit` (server.ts) or an external API (OpenAI/Google)?
    *   *Internal*: Restart server to reset memory cache, or increase limit in `server.ts`.
    *   *External*: Rotate API keys or switch models.
2.  **Analyze Traffic**: Is it a DoS attack?
    *   *Yes*: Block IP at firewall/Cloudflare level.

### Scenario E: CORS Errors
**Trigger**: Frontend console "Access-Control-Allow-Origin" error.

1.  **Verify Origin**: Is the user accessing from a new domain?
    *   *Action*: Add domain to `allowedOrigins` in `server.ts`.
2.  **Verify Environment**: Is it Prod trying to hit Dev?

---

### Scenario L: Content Refresh Script Failure (429 Rate Limits)
**Trigger**: GitHub Action "Auto Update Lessons" fails with "Failed to generate content: All models hit rate limits".

1.  **Wait and Retry**: This is usually a daily or per-minute quota issue. If it fails once, wait a few hours and trigger it manually from the Actions tab.
2.  **Verify Models**: The script (`backend/scripts/refresh-content.ts`) uses a fallback list. Check if Google has released new models that should be added to `modelsToTry`.
3.  **Local Execution**: If you need content immediately, run `npx tsx backend/scripts/refresh-content.ts` from the root. Be prepared for it to take 5-10 minutes if it hits quotas.

---

> **Remember**: In an incident, **Communication > Code**. Tell the team/users what is happening.
### Scenario F: UI Bugs / Visual Regressions
**Trigger**: User report "Button looks broken on mobile" or "Colors are wrong".

1.  **Reproduce in Storybook**:
    *   Run `npm run storybook`.
    *   **Simple Components**: Check `Flashcard`, `Navbar`, `GrammarReport`.
    *   **Complex Flows**: Use `ConversationMode` or `DialogueGenerator`. These use **mocked network calls**, so you can reproduce "Loading" or "Error" states just by selecting the story args, without needing the real backend.
2.  **Verify Fix**:
    *   Fix the CSS/Component.
    *   Verify locally in Storybook (it auto-reloads).
    *   Commit.

### Scenario H: Authentication UI Issues
**Trigger**: User reports "Cannot login" or "Forms validation failing".

1.  **Check Context**: Verify that `AuthProvider` is wrapping the `App` in `main.tsx`. If it is missing, `useAuth()` will throw an error.
2.  **Verify Firebase Error**: Check console for specific error codes (`auth/invalid-credential`).
    *   If specific error is caught but message is generic, check `SignInForm.tsx` catch block.
3.  **Persistence Issues**: If "Remember Me" fails, check `localStorage` keys starting with `firebase:authUser`.
4.  **Password Validation**: The `SignUpForm` uses strict regex in `useFormValidation.ts`.

### Scenario I: Documentation Gaps
**Trigger**: Developer cannot find type definitions or API usage.

1.  **Generate Docs**: Run `npm run doc`.
2.  **Verify Output**: Check `docs/api/index.html`.
3.  **Missing Types**: If a service is missing, check if it is exported in `typedoc.json` entry points.

### Scenario J: Google Auth Configuration Error
**Trigger**: Console error `auth/operation-not-allowed` during Google Login.

1.  **Firebase Console**: Go to **Authentication** -> **Sign-in method**.
2.  **Enable Google**: Click on **Add new provider** and select **Google**.
3.  **Enable Switch**: Toggle the "Enable" switch.
4.  **Project Support Email**: Select a project support email and Save.
5.  **CORS/Authorized Domains**: Ensure `localhost` and your production domain are in the **Authorized domains** list in the same tab.

### Scenario K: Failing Coverage or Tests
**Trigger**: `npm test` fails with low coverage or broken tests.

1.  **Honest Coverage Policy**: 
    - We prioritize **100% Domain Coverage** (services in `src/services`).
    - UI Components and Hooks are tested for the "Happy Path". Reaching 80%+ global coverage is **not recommended** if it involves extreme mocking of browser APIs (e.g., `useTTS`).
2.  **Run Coverage**: 
    - Root: `npm test`
    - Frontend specific: `npm run test:coverage:check -w frontend`
3.  **Mocking Auth**: If a component fails because of `useAuth`, ensure it is wrapped in an `AuthProvider` mock in the test file or use the global setup in `test/setup.js`.
4.  **Storybook Failing**: Stories are tested as part of the coverage. If they fail, check `.storybook/preview.jsx` to ensure `AuthProvider` is correctly wrapping the decorators.
