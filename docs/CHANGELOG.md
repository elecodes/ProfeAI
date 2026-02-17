# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.1] - 2026-02-17

### Added
- **Security Hardening**: Integrated monorepo-level `overrides` in the root `package.json` to resolve critical transitive vulnerabilities (e.g., `qs@6.14.2`).
- **Dockerfile Hardening**: Added `apk upgrade` and `npm -g install npm@latest` to the production runner stage to mitigate base image vulnerabilities.

### Changed
- **Dependency Updates**: Updated core SDKs for security: `@aws-sdk/client-polly@3.991.0`, `@google-cloud/text-to-speech@6.4.0`, and `langchain@1.2.8`.

## [1.2.0] - 2026-02-05

### Added
- **Mobile First Adaptation**: Full responsive overhaul for mobile devices, including optimized layouts for HomePage, Profile, and Chat.
- **ElevenLabs Widget Optimization**: Refined positioning (top-right fixed) and scaling (0.7) for the AI tutor widget to ensure it remains visible without obstructing content.
- **Improved UI Heuristics**: Added specific mobile navigation (hamburger menu) and centered profile visuals.

### Fixed
- **Widget Overlap**: Resolved issues where the ElevenLabs widget was covered by the navigation bar or appeared collapsed.
- **Responsive Layouts**: Fixed overflow issues in the main dashboard and session cards on small screens.

## [1.1.0] - 2026-02-03

### Added
- **Gemini 2.5 Integration**: Added support for Gemini 2.5 Flash and Gemini 2.5 Flash Lite.
- **AI Model Reporting**: The frontend and backend now log the specific AI model name responding to requests for full transparency.
- **Sequential Fallback Strategy**: Replaced racing models with a sequential strategy to conserve API quota and improve reliability.
- **Monorepo Migration**: Separated codebase into `frontend/` and `backend/` workspaces for better dependency management and clarity.
- **New Express API**: Migrated core endpoints to a cleaner Node.js/Express structure under `/api/v1`.
- **Unified Auth State**: Implemented `AuthProvider` and `AuthContext` to manage a single source of truth for authentication.
- **Improved Persistence**: Added "Remember Me" functionality using Firebase persistence levels.
- **Functional Password Reset**: Integrated real email recovery flow for users.
- **Google Authentication**: Added one-click Google Sign-In and Sign-Up.
- **"Honest Coverage" Strategy**: Achieved 100% domain coverage for core services (`LessonService`, `UserService`).
- **Root Shortcuts**: Added `npm test` and `npm run build` to the root project for easier development.

### Fixed
- **TTS Routing**: Resolved 404 errors by standardizing all requests to `/api/tts`.
- **Auth Configuration**: Corrected Firebase project environment variables and CSP settings for `apptutor-a4230`.
- **Dialogue Generator**: Fixed 404 and validation errors (case-sensitivity) in the dialogue generation flow.
- **Storybook Integration**: Fixed test failures by wrapping stories in `AuthProvider`.
- **Backend Test Separation**: Removed obsolete frontend tests for services moved to the backend.

## [1.0.0] - 2025-11-16

### Added
- Initial release of the application.
- Basic project structure with React, Vite, and Express.
- Flashcard component for learning.
- Lessons data for different levels.
