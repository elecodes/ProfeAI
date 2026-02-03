# 🇺🇸 Profe AI - Your AI Spanish Tutor

Profe AI is an interactive web application designed to help students learn Spanish through structured lessons, pronunciation practice (TTS), quizzes, and dynamic conversations powered by Artificial Intelligence.

![AppTutor Screenshot](https://via.placeholder.com/800x400?text=AppTutor+Preview)

## ✨ Key Features

*   **📚 Dynamic Lessons:** Content managed in **Firestore**, allowing updates without redeployment.
*   **🗣️ Premium Text-to-Speech (TTS):** Prioritizes **Amazon Polly** and **ElevenLabs** for natural-sounding voice, with automatic fallback to Google Cloud and Web Speech API.
*   **🤖 AI Tutor (Roleplay):** Practice real-life situations (e.g., "At the restaurant") with an AI tutor that adapts to your proficiency level.
*   **👨‍⚕️ Grammar Doctor:** Grammar analysis with robust validation (**Zod**).
*   **🔒 Enhanced Security:** Protection with **Helmet.js** (CSP), automatic **HTTPS** (Let's Encrypt), and automatic updates (**Dependabot**).
*   **💬 Hybrid Conversation Mode:** Fluid voice and text chat.
*   **✅ Progress Tracking:** Visualize your progress by weeks and levels (with full reset option).
*   **♿ Accessibility & UX Heuristics:**
    *   **Keyboard Navigation:** Full mouseless control (Tab, Enter, Escape).
    *   **Screen Readers:** Descriptive ARIA labels on all buttons.
    *   **Status Indicators:** "Thinking..." animations during AI generation to improve perceived performance.
*   **⚡ Advanced Performance:**
    *   **Lazy Loading:** Progressive page loading for instant startup.
    *   **AI Model Reporting:** System logs exactly which AI model is responding to the console (e.g., "Gemini 2.5 Flash Lite").
    *   **Sequential Fallback:** Prioritizes **Gemini 2.5 Flash Lite** and **Gemini 2.5 Flash** with automatic fallback to stable models to ensure availability and save cost.
*   **🔐 Authentication:** Secure registration with Firebase Auth.

## 🛠️ Technologies Used

*   **Frontend:** React, Vite, Tailwind CSS.
*   **Backend:** Node.js, Express, **Helmet.js**.
*   **Infrastructure:** **Docker**, **Nginx** (Reverse Proxy), **Certbot** (SSL).
*   **Database:** Firebase Firestore & Authentication.
*   **AI & Services:** LangChain, **Genkit** (Orchestration), OpenAI, Amazon Polly, Google Cloud TTS, ElevenLabs, **Tavily** (Search).
*   **Quality:** Sentry, Playwright, Vitest, Lighthouse, **Snyk**, **Husky**, **Dependabot**.

## 🚀 Prerequisites

*   [Node.js](https://nodejs.org/) (v18+)
*   [Docker](https://www.docker.com/) (for deployment and HTTPS)
*   Firebase Account (Firestore and Auth enabled)
*   API Keys: OpenAI, AWS (Polly), Google Cloud, ElevenLabs.

## 📥 Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/apptutor.git
    cd apptutor
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure environment variables:**
    Create a `.env` file based on `.env.example`:
    ```env
    # AI & Voice
    OPENAI_API_KEY=sk-...
    AWS_ACCESS_KEY_ID=...
    AWS_SECRET_ACCESS_KEY=...
    AWS_REGION=us-east-1

    # Genkit & Search
    GOOGLE_GENAI_API_KEY=...
    TAVILY_API_KEY=tv-...
    
    # Firebase
    GOOGLE_APPLICATION_CREDENTIALS=./path/to/credentials.json
    
    # Security
    PORT=3001
    ```

4.  **Load Content (Seed):**
    Upload initial lessons to Firestore:
    ```bash
    node scripts/seedLessons.js
    ```

## ▶️ Execution

### Local Development (HTTP)
```bash
npm run dev
```
Access at `http://localhost:5173`.

### Secure Local Development (HTTPS)
To test features requiring SSL (like microphone access in some browsers):
1.  Generate certificates:
    ```bash
    ./init-local-https.sh
    ```
2.  Access at `https://localhost`.

### Production (Docker + HTTPS)
Deployment with Nginx and automatic Let's Encrypt certificates:

1.  Configure your domain in `init-letsencrypt.sh` and `nginx/conf/app.conf`.
2.  Initialize certificates:
    ```bash
    ./init-letsencrypt.sh
    ```
3.  Start services:
    ```bash
    docker-compose -f docker-compose.prod.yml up -d
    ```
Access at `https://your-domain.com`.

## 🧪 Testing and Quality

*   **Unit:** `npm test`
*   **E2E:** `npm run test:e2e`
*   **Linting:** `npm run lint`
*   **Security:** `npm run test:security` (Snyk)

## 📄 License

This project is licensed under the MIT License.
