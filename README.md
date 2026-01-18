# 🇪🇸 Profe AI - Tu Tutor de Español con IA
> [Read this document in English 🇺🇸](README_en.md)

Profe AI es una aplicación web interactiva diseñada para ayudar a estudiantes a aprender español mediante lecciones estructuradas, práctica de pronunciación (TTS), cuestionarios y conversaciones dinámicas impulsadas por Inteligencia Artificial.

![AppTutor Screenshot](https://via.placeholder.com/800x400?text=AppTutor+Preview)

## ✨ Características Principales

*   **📚 Lecciones Dinámicas:** Contenido gestionado en **Firestore** que permite actualizaciones sin redesepliegue.
*   **🗣️ Texto a Voz (TTS) Premium:** Prioriza **Amazon Polly** y **ElevenLabs** para una voz natural, con fallback automático a Google Cloud y Web Speech API.
*   **🤖 Tutor de IA (Roleplay):** Practica situaciones reales (ej. "En el restaurante") con un tutor de IA que se adapta a tu nivel.
*   **👨‍⚕️ Doctor Gramática:** Análisis gramatical con validación robusta (**Zod**).
*   **🔄 Contenido Fresco Automático:** Script automatizado (Github Actions) que genera nuevas frases y quizzes cada 2 semanas usando **Gemini 2.0**.
*   **🔒 Seguridad Reforzada:** Protección con **Helmet.js** (CSP), **HTTPS** automático (Let's Encrypt) y actualizaciones automáticas (**Dependabot**).
*   **💬 Modo Conversación Híbrido:** Chat de texto y voz fluido.
*   **✅ Seguimiento de Progreso:** Visualiza tu avance por semanas y niveles.
*   **🔐 Autenticación:** Registro seguro con Firebase Auth.

## 🛠️ Tecnologías Utilizadas

*   **Frontend:** React, Vite, Tailwind CSS.
*   **Backend:** Node.js, Express, **Helmet.js**.
*   **Infraestructura:** **Docker**, **Nginx** (Reverse Proxy), **Certbot** (SSL).
*   **Base de Datos:** Firebase Firestore & Authentication.
*   **IA & Servicios:** LangChain, **Genkit** (Orchestration), OpenAI, Amazon Polly, Google Cloud TTS, ElevenLabs, **Tavily** (Search).
*   **Calidad:** Sentry, Playwright, Vitest, Lighthouse, **Snyk**, **Husky**, **Dependabot**.

## 🚀 Requisitos Previos

*   [Node.js](https://nodejs.org/) (v18+)
*   [Docker](https://www.docker.com/) (para despliegue y HTTPS)
*   Cuenta de Firebase (Firestore y Auth habilitados)
*   Claves de API: OpenAI, AWS (Polly), Google Cloud, ElevenLabs.

## 📥 Instalación

1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/tu-usuario/apptutor.git
    cd apptutor
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar variables de entorno:**
    Crea un archivo `.env` basado en `.env.example`:
    ```env
    # IA & Voz
    OPENAI_API_KEY=sk-...
    AWS_ACCESS_KEY_ID=...
    AWS_SECRET_ACCESS_KEY=...
    AWS_REGION=us-east-1

    # Genkit & Search
    GOOGLE_GENAI_API_KEY=...
    TAVILY_API_KEY=tv-...
    
    # Firebase
    GOOGLE_APPLICATION_CREDENTIALS=./path/to/credentials.json
    
    # Seguridad
    PORT=3001
    ```

4.  **Cargar Contenido (Seed):**
    Sube las lecciones iniciales a Firestore:
    ```bash
    node scripts/seedLessons.js
    ```

5.  **Actualizar Contenido con IA (Opcional):**
    Para generar contenido fresco manualmente:
    ```bash
    # Requiere service-account.json en la raíz
    npx tsx scripts/refresh-content.ts
    ```

## ▶️ Ejecución

### Desarrollo Local (HTTP)
```bash
npm run dev
```
Accede a `http://localhost:5173`.

### Desarrollo Local Seguro (HTTPS)
Para probar características que requieren SSL (como el micrófono en algunos navegadores):
1.  Generar certificados:
    ```bash
    ./init-local-https.sh
    ```
2.  Acceder a `https://localhost`.

### Producción (Docker + HTTPS)
Despliegue con Nginx y certificados Let's Encrypt automáticos:

1.  Configura tu dominio en `init-letsencrypt.sh` y `nginx/conf/app.conf`.
2.  Inicializa certificados:
    ```bash
    ./init-letsencrypt.sh
    ```
3.  Arranca los servicios:
    ```bash
    docker-compose -f docker-compose.prod.yml up -d
    ```
Accede a `https://tu-dominio.com`.

## 🧪 Tests y Calidad

*   **Unitarios:** `npm test`
*   **E2E:** `npm run test:e2e` (Ejecuta tests con Playwright contra el servidor de desarrollo local `http://localhost:5173`)
*   **Linting:** `npm run lint`
*   **Seguridad:** `npm run test:security` (Snyk)

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.
