# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.7] - 2026-04-23

### Fixed
- **TTS Male Voices**: Male characters (e.g., Carlos, Don José) no longer sound female. Root cause: `Enrique` voice was configured with `Engine: "neural"` but only supports `"standard"`. Replaced with `Sergio` (the only neural-capable Spanish male voice).
- **TTS Fallback Gender Loss**: When primary TTS provider failed, the retry logic passed empty options `{}`, defaulting all voices to female. Fallback now preserves the original `gender` parameter.

### Changed
- Added debug logging (`POLLY DEBUG`) to TTS service for voice/engine observability.
- ADR 015 documents the root cause analysis and voice compatibility matrix.

## [1.2.6] - 2026-04-17

### Added
- Unified Firebase Client initialization in `backend/src/lib/firebase.ts` for consistent script execution.
- Scenario U (Broken Backend Scripts) to the Incident Response Playbook.
- ADR 014 documenting the hardening of Firebase configuration and dependency management.

### Fixed
- Broken imports in `backend/scripts/seedLessons.js` and `backend/scripts/debugConnection.js`.
- Security vulnerability: Hardcoded Firebase configuration in `frontend/src/config/firebase.ts` (replaced with environment variables).
- Snyk security alerts: "Allocation of Resources Without Limits" and "Information Exposure (X-Powered-By header)".
- Incorrect dependency categorization in `frontend/package.json`.

### Changed
- Refactored `seedLessons.js` to use admin credentials from `.env` instead of a manual service account file.
- Enabled strictly secure CSP and rate limiting in the backend.

## [1.2.5] - 2026-03-15

### Added
- AI Content Refresh system with fallback strategies.
- Automated daily health checks.

### Fixed
- Grammar analysis validation with Zod.

## [1.2.0] - 2026-02-01

### Added
- Monorepo structure with npm workspaces.
- Integration with Google Gemini for tutor roleplay.
