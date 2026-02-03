# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-02-03

### Added
- **Gemini 2.5 Integration**: Added support for Gemini 2.5 Flash and Gemini 2.5 Flash Lite.
- **AI Model Reporting**: The frontend and backend now log the specific AI model name responding to requests for full transparency.
- **Sequential Fallback Strategy**: Replaced racing models with a sequential strategy to conserve API quota and improve reliability.
- **New Express API**: Migrated core endpoints to a cleaner Node.js/Express structure under `/api/v1`.

### Fixed
- **TTS Routing**: Resolved 404 errors by standardizing all requests to `/api/tts`.
- **Auth Configuration**: Corrected Firebase project environment variables and CSP settings for `apptutor-a4230`.
- **Dialogue Generator**: Fixed 404 and validation errors (case-sensitivity) in the dialogue generation flow.

## [1.0.0] - 2025-11-16

### Added
- Initial release of the application.
- Basic project structure with React, Vite, and Express.
- Flashcard component for learning.
- Lessons data for different levels.
