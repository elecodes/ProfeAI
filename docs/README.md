# 📚 Project Documentation

Welcome to the **AppTutor Safe** documentation hub.

## 🛠 Operational Guides
- **[Incident Playbook](./PLAYBOOK.md)**: 🚨 **CRITICAL**. Read this if the system is down, if you encounter Rate Limit errors (429), or UI bugs.

## 🏗 Architecture & Design
- **[Master Design Doc](../DESIGN_master.md)**: The core source of truth for the project's architecture, data models, and prompt engineering strategies.
- **[Genkit Service](../src/lib/genkit.ts)**: AI Service configuration and prompt definitions.

## 🎨 UI & Component Library
- **Storybook**: We use Storybook to develop components in isolation.
  - Run: `npm run storybook`
  - Location: `src/stories/`

## 🔒 Security
- **Rate Limiting**: Configured in `server.ts` (100 req/15min).
- **CORS**: Restricted to local frontend development.
- **Audit**: Security checks are implemented in `test/security-check.js`.

## 🧹 Maintenance Guide
To keep this documentation alive, follow these rules:

1.  **New Feature?** → Update `DESIGN_master.md` (Architecture) & Add Story (UI).
2.  **New Bug Found?** → Add the scenario to `PLAYBOOK.md` so we solve it faster next time.
3.  **New Secret/Key?** → Update `.env.example` (NEVER the real .env).

