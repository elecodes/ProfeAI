# AppTutor Master Design Document


## 1. Overview


AppTutor is an interactive web application designed to help students learn Spanish. It provides a comprehensive learning experience through structured lessons, pronunciation practice, AI-powered conversational role-playing, and grammar analysis. The platform is designed to be dynamic, secure, and scalable, leveraging a modern technology stack.


## 2. System Architecture


The application follows a client-server architecture, with a React single-page application (SPA) for the frontend and a Node.js/Express server for the backend. In production, the system is containerized using Docker and fronted by an Nginx reverse proxy for SSL termination and serving static assets.


```
+----------------+      +------------------+      +-------------------+
|   User's       |      |  Nginx           |      |  Node.js/Express  |
|   Browser      <----->|  Reverse Proxy   <----->|  Backend Server   |
+----------------+      |  (SSL)           |      +-------------------+
      |                +------------------+             |
      |                                                 |
      |                               +-----------------v-+
      |                               | External Services |
      |                               | (Firebase, AI APIs)|
      +------------------------------>+-------------------+
```


## 3. Frontend (Client-side)


The frontend is a modern React application built with Vite for a fast development experience.


*   **Framework:** React
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS, with some plain CSS (`App.css`, `index.css`)
*   **Key Components:**
   *   `App.jsx`: The root component of the application, responsible for routing and layout.
   *   `ConversationMode.jsx`: A component for the AI tutor conversational interface.
   *   `DialogueGenerator.jsx`: Generates dialogues for practice.
   *   `DialogueViewer.jsx`: Displays dialogues.
   *   `Flashcard.jsx`: A component for interactive flashcards.
   *   `GrammarReport.jsx`: Displays grammar analysis results.
   *   `auth/`: Components related to user authentication (Login, Signup).
   *   `profile/`: Components for user profile management.
*   **State Management:** While a specific library isn't listed, state management is likely handled through a combination of React's built-in hooks (`useState`, `useContext`, `useReducer`) and custom hooks (`useAuth.js`, `useTTS.js`).
*   **Routing:** React Router is likely used for client-side routing, although not explicitly mentioned in `package.json`. The presence of `LoginPage.jsx` and `Profile.jsx` in `src/pages` suggests a multi-page structure handled by a router.


## 4. Backend (Server-side)


The backend is a Node.js application using the Express framework to provide a RESTful API for the frontend.


*   **Framework:** Express.js
*   **File:** `server.js`
*   **Key Services:**
   *   `ConversationService.js`: Manages the logic for the AI tutor conversations.
   *   `DialogueGenerator.js`: Service for generating dialogues.
   *   `GrammarService.js`: Handles grammar analysis requests.
   *   `LessonService.js`: Fetches lesson content from Firestore.
   *   `StorageService.js`: Interacts with Firebase Storage (e.g., for user-uploaded content).
   *   `TTSService.js`: Manages text-to-speech generation with external providers.
   *   `UserService.js`: Handles user-related operations.
*   **Middleware:**
   *   `rateLimit.js`: Provides protection against DoS attacks by limiting the number of requests from a single IP.
   *   `validate.js`: Likely contains middleware for validating incoming request data, possibly using a library like Zod (as hinted by `src/schemas/api.js`).
*   **API Endpoints:** The server exposes API endpoints for features like fetching lessons, generating dialogues, analyzing grammar, and handling user authentication. These are defined in `server.js` and organized using Express routers.


## 5. AI and External Services


AppTutor integrates with several external services to provide its core features:


*   **Firebase:**
   *   **Firestore:** A NoSQL database used to store lesson content, user progress, and other application data.
   *   **Firebase Authentication:** Used for user registration and login.
*   **AI Services:**
   *   **OpenAI:** The core of the AI Tutor and Grammar Doctor features.
   *   **LangChain:** Used as a framework to orchestrate interactions with AI models and other data sources.
   *   **Google Genkit:** Advanced AI orchestration framework used for flexible model management and fallback strategies.
   *   **Tavily:** Search API used by the AI agents to provide real-time cultural context and facts.
*   **Text-to-Speech (TTS) Services:**
   *   **Amazon Polly, ElevenLabs, Google Cloud TTS:** Premium TTS services used to generate high-quality, natural-sounding audio for pronunciation practice. The system has a fallback mechanism to ensure availability.
   *   **Web Speech API:** A browser-based API used as a fallback for TTS.


## 6. Database


*   **Database:** Firebase Firestore
*   **Data Models:**
   *   **Lessons:** Lessons are likely stored in collections, organized by level (e.g., `beginner`, `intermediate`, `advanced`) and topic (e.g., `greetings`, `food`). The `scripts/seedLessons.js` script provides the initial schema.
   *   **Users:** User data, including authentication information and progress, is managed by Firebase Authentication and Firestore.
   *   **User Progress:** A collection to track which lessons a user has completed and their performance.
*   **Data Seeding:** The `scripts/seedLessons.js` script is used to populate the Firestore database with initial lesson content from local JSON files (`src/lessons`).


## 7. Infrastructure and Deployment


The application is designed to be deployed using Docker for consistency across development and production environments.


*   **Containerization:** Docker is used to containerize the Node.js application and the Nginx reverse proxy.
   *   `Dockerfile`: Defines the image for the Node.js application.
   *   `docker-compose.yml`: For local development.
   *   `docker-compose.prod.yml`: For production deployments.
*   **Reverse Proxy:** Nginx is used as a reverse proxy in production to:
   *   Handle SSL/TLS termination.
   *   Serve the static frontend assets.
   *   Proxy API requests to the Node.js server.
*   **HTTPS:**
   *   **Let's Encrypt:** Used to obtain free SSL certificates.
   *   **Certbot:** The tool used to automate the process of obtaining and renewing Let's Encrypt certificates.
   *   `init-letsencrypt.sh`: A script to initialize the SSL certificates.
   *   `init-local-https.sh`: A script to generate self-signed certificates for local HTTPS development.


## 8. Security


Security is a key consideration in the AppTutor project.


*   **Helmet.js:** A collection of middleware that sets various HTTP headers to protect against common web vulnerabilities (e.g., Cross-Site Scripting (XSS), clickjacking).
*   **Rate Limiting:** Protects against brute-force and Denial-of-Service (DoS) attacks.
*   **Input Validation:** The backend validates and sanitizes all incoming data to prevent XSS and other injection attacks. The use of Zod (`src/schemas/api.js`) provides a structured way to define and enforce data schemas.
*   **HTTPS:** All communication in production is encrypted using SSL/TLS.
*   **Dependabot:** Automatically keeps project dependencies up-to-date, patching known vulnerabilities.
*   **Snyk:** Scans dependencies for known security vulnerabilities.


## 9. Testing and Quality Assurance


The project has a comprehensive testing and quality assurance strategy.


*   **Unit and Integration Testing:**
   *   **Framework:** Vitest
   *   **Tests:** Located in `src/tests`, covering components, services, and utility functions.
*   **End-to-End (E2E) Testing:**
   *   **Framework:** Playwright
   *   **Tests:** Located in `src/tests/e2e`, simulating user flows through the application.
*   **Linting:**
   *   **Tool:** ESLint
   *   **Configuration:** `eslint.config.js`
   *   **Command:** `npm run lint`
*   **Performance Monitoring:**
   *   **Tool:** Lighthouse
   *   **Configuration:** `.lighthouserc.json`
*   **Error Tracking:**
   *   **Tool:** Sentry
   *   **Configuration:** Initialized in `src/main.tsx`
*   **Vulnerability Scanning:**
   *   **Tool:** Snyk
   *   **Command:** `npm run test:security`
*   **Git Hooks:**
   *   **Tool:** Husky
   *   **Usage:** Enforces pre-commit checks (linting, testing).


## 10. Project Structure


```
/
├───.genkit/          # Genkit local configuration
├───.github/          # GitHub Actions workflows (CI/CD)
├───.husky/           # Git hooks
├───certbot/          # SSL certificate files
├───dist/             # Build output
├───docs/             # Project documentation
├───firebase/         # Firebase configuration
├───nginx/            # Nginx configuration
├───node_modules/     # Project dependencies
├───public/           # Static assets
├───scripts/          # Node.js scripts (e.g., database seeding)
├───src/              # Application source code
│   ├───assets/       # Static assets like images
│   ├───components/   # Reusable React components
│   ├───config/       # Application configuration
│   ├───data/         # Static data
│   ├───hooks/        # Custom React hooks
│   ├───lessons/      # Lesson content in JSON format
│   ├───lib/          # Core libraries (Genkit)
│   ├───middleware/   # Express middleware
│   ├───pages/        # Top-level page components
│   ├───prompts/      # AI Prompts (Genkit/Dotprompt)
│   ├───schemas/      # Data validation schemas (Zod)
│   ├───services/     # Backend service modules
│   ├───tests/        # Automated tests
│   ├───types/        # TypeScript type definitions
│   ├───utils/        # Utility functions
│   ├───App.tsx       # Main application component
│   └───main.tsx      # Entry point
├───test/             # Test setup and configuration
├───.env.example      # Example environment variables
├───docker-compose.yml # Docker Compose for development
├───Dockerfile        # Docker configuration for the app
├───package.json      # Project metadata and dependencies
├───server.ts         # Backend Express server entry point
└───vite.config.js    # Vite configuration
```







Antigravity answer:

# Master Design Document: AppTutor (Tutor de Idiomas)


## 1. Project Overview


**AppTutor** is a comprehensive language learning application designed to help users learn Spanish through a variety of interactive methods. It combines traditional learning techniques (flashcards, quizzes) with advanced AI-powered features (conversation roleplay, dynamic dialogue generation, grammar analysis) to provide a holistic learning experience.


### Core Objectives
-   Provide structured lessons for different proficiency levels (Beginner, Intermediate, Advanced).
-   Enable realistic conversation practice using AI agents.
-   Offer instant feedback on grammar and pronunciation.
-   Track user progress and mastery of vocabulary.


## 2. Architecture & Technology Stack


The application follows a **Client-Server** architecture, leveraging modern web technologies and cloud services.


### 2.1 Frontend
-   **Framework**: React (v18) with Vite (v7).
-   **Language**: JavaScript (ES Modules).
-   **Styling**: TailwindCSS (v4).
-   **State Management**: React Hooks (`useState`, `useEffect`, `useContext`).
-   **Routing**: Single Page Application (SPA) handled by React (conditional rendering in `App.jsx`).
-   **Build Tool**: Vite.


### 2.2 Backend
-   **Server**: Node.js with Express (v4).
-   **Security**: Helmet (CSP), CORS, Rate Limiting.
-   **API**: RESTful endpoints for AI and TTS services.
-   **Hosting**: Serves static frontend assets (`dist`) and API routes.


### 2.3 Database & Authentication
-   **Platform**: Firebase.
-   **Authentication**: Firebase Auth (Email/Password).
-   **Database**: Cloud Firestore (NoSQL) for user profiles, progress tracking, and learned phrases.







### 2.4 AI & Machine Learning Services
-   **LLM Orchestration:** LangChain & **Google Genkit**.
-   **AI Provider:** OpenAI (via LangChain) and Gemini (via Genkit) for conversation and grammar analysis.
-   **Search Tool:** **Tavily** (for real-time cultural data).
-   **Text-to-Speech (TTS)**: Multi-provider support with fallback strategy:
   1.  **ElevenLabs** (Premium quality).
   2.  **Google Cloud TTS** (High quality).
   3.  **AWS Polly** (Standard quality).
   4.  **Web Speech API** (Browser fallback).


### 2.5 Testing & Quality
-   **Unit/Integration**: Vitest.
-   **E2E Testing**: Playwright.
-   **Accessibility**: Pa11y CI.
-   **Performance**: Lighthouse CI.
-   **Linting**: ESLint.


## 3. Features & Implementation Details


### 3.1 Study Mode
-   **Description**: Structured weekly lessons based on proficiency level.
-   **Implementation**:
   -   Lessons loaded from `src/utils/loadLessons.js`.
   -   Progressive unlocking system based on user progress (`UserService.getUnlockedWeeks`).
   -   Flashcard-style interface with audio pronunciation.


### 3.2 Conversation Mode (AI Roleplay)
-   **Description**: Interactive chat with an AI tutor.
-   **Implementation**:
   -   **Frontend**: `ConversationMode.jsx` handles UI and speech input.
   -   **Backend**: `/api/chat/start` and `/api/chat/message` endpoints.
   -   **Logic**: `ConversationService.js` manages session state and prompts OpenAI via LangChain.


### 3.3 Dialogue Mode
-   **Description**: View pre-written dialogues or generate new ones on specific topics.
-   **Implementation**:
   -   **Static**: Loaded from `src/lessons/dialogues.js`.
   -   **Dynamic**: `/api/generate-dialogue` endpoint uses `DialogueGenerator.js` to create custom scenarios.


### 3.4 Quiz Mode
-   **Description**: Multiple-choice tests to reinforce vocabulary.
-   **Implementation**:
   -   Dynamic option generation from current lesson vocabulary.
   -   Score tracking and history saved to Firestore (`UserService.recordSession`).


### 3.5 Grammar Analysis
-   **Description**: Analyze user text for grammatical correctness.
-   **Implementation**:
   -   **Backend**: `/api/grammar/analyze` endpoint.
   -   **Service**: `GrammarService.js` uses LLM to provide detailed feedback and corrections.


### 3.6 User Profile
-   **Description**: Manage account and view progress.
-   **Implementation**:
   -   `Profile.jsx` displays stats and level.
   -   Data persisted in Firestore `users` collection.


## 4. Data Models (Firestore)


### `users` Collection
Document ID: `uid`
```json
{
 "email": "user@example.com",
 "displayName": "User Name",
 "level": "beginner", // beginner, intermediate, advanced
 "createdAt": Timestamp,
 "lastLogin": Timestamp,
 "learnedPhrases": [
   { "text": "Hola", "translation": "Hello", "learnedAt": Timestamp }
 ],
 "progress": {
   "completedWeeks": 2,
   "totalPoints": 150
 }
}
```


### `study_sessions` Sub-collection (under `users/{uid}`)
```json
{
 "type": "quiz", // or conversation, dialogue
 "score": 8,
 "total": 10,
 "timestamp": Timestamp,
 "topic": "Week 1: Greetings"
}
```


## 5. API Endpoints


| Method | Endpoint | Description | Body Params |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/chat/start` | Start new AI chat | `topic`, `level`, `sessionId` |
| `POST` | `/api/chat/message` | Send message to AI | `message`, `sessionId`, `topic`, `level` |
| `POST` | `/api/grammar/analyze` | Analyze grammar | `text`, `context` |
| `POST` | `/api/generate-dialogue` | Generate dialogue | `topic`, `level` |
| `POST` | `/tts` | Generate speech | `text`, `language`, `options` |
| `GET` | `/tts/status` | Check TTS providers | - |


## 6. Security Measures


-   **Helmet**: Configures HTTP headers for security (CSP, HSTS, etc.).
-   **CORS**: Restricts cross-origin requests to allowed domains.
-   **Rate Limiting**: Prevents abuse (DoS protection) on API endpoints.
-   **Input Validation**: `zod` schemas used to validate API request bodies.
-   **Environment Variables**: Sensitive keys (API keys, DB config) stored in `.env` (not committed).


## 7. Directory Structure


```
/
├── .github/            # GitHub Actions workflows
├── firebase/           # Firebase configuration
├── src/
│   ├── components/     # React components
│   ├── config/         # Configuration (env, agents)
│   ├── hooks/          # Custom React hooks (useAuth, useTTS)
│   ├── lessons/        # Static lesson content
│   ├── pages/          # Main page components
│   ├── services/       # Frontend API services
│   ├── tests/          # Unit and integration tests
│   ├── App.jsx         # Main application component
│   └── main.jsx        # Entry point
├── server.js           # Express backend server
└── package.json        # Dependencies and scripts
```


.
