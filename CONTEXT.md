# Project Context

This document provides context on the technical implementation of the AppTutor project.

## Technologies

*   **Frontend:** [React](https://react.dev/) with [Vite](https://vitejs.dev/) for a fast development experience.
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) for a utility-first CSS framework.
*   **Backend:** [Node.js](https://nodejs.org/) with [Express.js](https://expressjs.com/) for the API.
*   **Text-to-Speech:** [ElevenLabs API](https://elevenlabs.io/) is used for generating audio from text.

## Architecture

The project is a monolith with a React frontend and an Express backend.

### Frontend

The frontend is a standard React application bootstrapped with Vite. It consumes data from the backend and local JSON files.

### Backend

The backend is an Express.js server with a primary role of providing a Text-to-Speech (TTS) service.

#### API Endpoints

*   **`POST /tts`**: Converts text to speech.
    *   **Request Body:**
        ```json
        {
          "text": "The text to convert to speech.",
          "language": "en"
        }
        ```
    *   **`language` can be `en` (English) or `es` (Spanish).**
    *   **Response:** An audio file.

## Data

Lesson data is currently stored in JSON files under `public/lessons/`. There is a `strapi.ts` file in the `lib` folder, which suggests a future integration with [Strapi](https://strapi.io/) as a headless CMS for managing lessons.

## Design Decisions

*   **Vite over Create React App:** Vite is chosen for its faster development server and build times.
*   **Express.js for TTS:** A dedicated backend is used to securely handle the ElevenLabs API key and to avoid exposing it on the client-side.
*   **Tailwind CSS:** Chosen for rapid UI development and consistency.
