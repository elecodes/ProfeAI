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

### 2. Dependency Management
- **Frontend Cleanup**: Removed `firebase-admin` from `frontend/package.json`.
- **Dependency Segregation**: Moved `firebase`, `react`, and `react-dom` from `devDependencies` to `dependencies` in the frontend workspace.
- **Audit**: Ran `npm install` and verified build stability with Vite.

## Consequences
- **Improved Security posture**: Snyk alerts for hardcoded secrets are resolved, and the codebase follows best practices for secret management.
- **Reduced Bundle Risk**: `firebase-admin` is no longer available in the frontend, preventing accidental usage of server-side secrets in the client.
- **Production Readiness**: Core execution dependencies are correctly categorized, ensuring they are included in production builds.
- **Onboarding**: New developers have a clear `.env.example` to follow for Firebase setup.
