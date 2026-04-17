# ADR 014: Hardening Firebase Config and Dependencies

## Status
Accepted

## Context
Snyk identified a security risk: "Hardcoded Non-Cryptographic Secret" in `frontend/src/config/firebase.ts`. Although the Firebase `apiKey` is publicly exposed in client bundles, hardcoding it in source control is a poor practice and triggers security alerts. 

Furthermore, the frontend `package.json` had `firebase-admin` included in the client-side dependencies. This is dangerous as it could lead to accidental exposure of service accounts or the inclusion of server-only logic in the client bundle. The project also had core dependencies like `firebase` (client SDK), `react`, and `react-dom` in `devDependencies`, which is incorrect for a production build.

## Decision
We implemented the following changes:

### 1. Security Hardening (Environment Variables)
- **Environment Variables**: Moved all Firebase configuration values to environment variables prefixed with `VITE_` (e.g., `VITE_FIREBASE_API_KEY`).
- **Config Cleanliness**: Updated `frontend/src/config/firebase.ts` to use `import.meta.env` exclusively, removing all hardcoded strings.
- **Example Update**: Updated `.env.example` to include all required Firebase variables.

### 3. Backend Security Hardening (Snyk Remediation)
- **Rate Limiting**: Implemented `express-rate-limit` globally and on the SPA fallback route to prevent DoS (CWE-770).
- **Header Security**: Disabled `X-Powered-By` and configured `helmet` with a strict CSP to prevent information exposure (CWE-200) and XSS.
- **Unified Firebase Init**: Created `backend/src/lib/firebase.ts` to centralize secure Firebase initialization for backend scripts, removing legacy `service-account.json` requirements.

## Consequences
- **Improved Security posture**: Snyk alerts for hardcoded secrets, resource allocation, and information exposure are resolved.
- **Reduced Bundle Risk**: `firebase-admin` is no longer available in the frontend, preventing accidental usage of server-side secrets in the client.
- **Production Readiness**: Core execution dependencies are correctly categorized, ensuring they are included in production builds.
- **Scalability**: Rate limiting protects the server from abusive traffic or simple DoS attacks.
- **Onboarding**: New developers have a clear `.env.example` to follow for Firebase setup, including the new `ADMIN_EMAIL` and `ADMIN_PASSWORD` for maintenance scripts.
