# Deploying Profe AI to Render

This guide explains how to deploy the Profe AI application to [Render](https://render.com/) using the provided Docker configuration.

## 🚀 Deployment Strategy
We use a **Unified Docker Build**. A single Dockerfile in the root:
1.  Compiles the React Frontend (Vite).
2.  Prepares the Node.js Backend (Express).
3.  Serves the static assets from the backend server.

## 🛠 Setup Steps

1.  **Repository**: Connect your GitHub repository to a new **Web Service** on Render.
2.  **Runtime**: Select **Docker**.
3.  **Environment Variables**:
    You must configure two types of variables in the Render Dashboard:

### A. Build-Time Environment Variables (CRITICAL)
Vite embeds these into the JavaScript bundle during compilation. They MUST be available during the build step. 
In the Render Dashboard, add these to the **Environment Variables** section. The Dockerfile will automatically capture them using `ARG`.

| Variable | Description |
| :--- | :--- |
| `VITE_FIREBASE_API_KEY` | Your Firebase Web API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | `project-id.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `project-id` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `project-id.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender ID from Firebase console |
| `VITE_FIREBASE_APP_ID` | App ID from Firebase console |

### B. Runtime Environment Variables
These are used by the backend server and can be updated without rebuilding the entire container.

| Variable | Description |
| :--- | :--- |
| `OPENAI_API_KEY` | Required for Gemini/Genkit |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to service account (if using local file) |
| `FIREBASE_SERVICE_ACCOUNT` | JSON string of your service account (recommended for Render) |
| `ELEVEN_LABS_API_KEY` | For premium TTS |
| `SENTRY_DSN` | (Optional) For error tracking |

## 🔒 Security
1.  **Authorized Domains**: Add your Render URL (e.g., `profeai.onrender.com`) to the **Authorized Domains** list in the Firebase Authentication console.
2.  **CORS**: The backend is configured to automatically allow requests from the Render parent domain.

## 🚒 Troubleshooting
-   **White Screen after Deploy**: Check if `VITE_*` variables were missing during build. Check Render **Build Logs**.
-   **Auth Popup Closes**: Ensure `crossOriginOpenerPolicy` is set to `false` in `backend/src/server.ts` (already default).
-   **Database Errors**: Ensure the `FIREBASE_SERVICE_ACCOUNT` JSON is valid and has permission to access Firestore.
