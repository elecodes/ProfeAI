# 🇪🇸 AppTutor - Tu Tutor de Español con IA

AppTutor es una aplicación web interactiva diseñada para ayudar a estudiantes a aprender español mediante lecciones estructuradas, práctica de pronunciación (TTS), cuestionarios y conversaciones dinámicas impulsadas por Inteligencia Artificial.

![AppTutor Screenshot](https://via.placeholder.com/800x400?text=AppTutor+Preview)

## ✨ Características Principales

*   **📚 Lecciones Estructuradas:** Contenido organizado por niveles (Principiante, Intermedio, Avanzado) y semanas.
*   **🗣️ Texto a Voz (TTS):** Escucha la pronunciación nativa de frases y diálogos utilizando Google Cloud TTS y Amazon Polly.
*   **🤖 Tutor de IA (Roleplay):** Practica situaciones reales (ej. "En el restaurante") con un tutor de IA que se adapta a tu nivel y mantiene el contexto de la conversación.
*   **👨‍⚕️ Doctor Gramática:** Recibe feedback detallado y correcciones gramaticales después de cada sesión de conversación.
*   **💬 Modo Conversación Híbrido:** Combina chat de texto inteligente (LangChain) con interacción de voz fluida (ElevenLabs).
*   **✅ Seguimiento de Progreso:** Marca frases como aprendidas y visualiza tu avance.
*   **🎯 Cuestionarios (Quiz):** Pon a prueba tus conocimientos con tests interactivos.
*   **🔐 Autenticación:** Sistema de registro y login seguro con Firebase Auth.
*   **♿ Accesibilidad:** Diseño inclusivo verificado con Pa11y.

## 🛠️ Tecnologías Utilizadas

*   **Frontend:** React, Vite, Tailwind CSS.
*   **Backend:** Node.js, Express.
*   **Base de Datos & Auth:** Firebase (Firestore, Authentication).
*   **IA & Servicios:**
    *   **LangChain + OpenAI:** Motor de conversación (Roleplay) y análisis gramatical.
    *   **Google Cloud TTS / Amazon Polly:** Síntesis de voz de alta calidad.
    *   **ElevenLabs:** Conversación fluida con avatares.
*   **Calidad & Monitoreo:**
    *   **Sentry:** Monitoreo de errores y rendimiento (RUM).
    *   **Zod:** Validación robusta de esquemas (API y variables de entorno).
    *   **Playwright:** Tests End-to-End (E2E).
    *   **Vitest:** Tests unitarios.
    *   **Lighthouse:** Auditoría de rendimiento y SEO.
    *   **Docker:** Contenerización completa.

## 📚 Documentación Adicional

*   **[Incident Response Playbook](docs/PLAYBOOK.md):** Guía para la gestión de incidentes críticos.
*   **[Agentes de IA](AGENTS.md):** Definición de los agentes y sus personalidades.

## 🚀 Requisitos Previos

Asegúrate de tener instalado:
*   [Node.js](https://nodejs.org/) (v18 o superior)
*   [Docker](https://www.docker.com/) (opcional, para ejecutar en contenedor)
*   Claves de API para: OpenAI, Google Cloud, Firebase, ElevenLabs, Sentry.

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
    Crea un archivo `.env` en la raíz basado en el siguiente ejemplo:
    ```env
    OPENAI_API_KEY=tu_clave_openai
    GOOGLE_APPLICATION_CREDENTIALS=./path/to/credentials.json
    VITE_ENABLE_SENTRY=true
    VITE_SENTRY_DSN=tu_dsn_sentry
    # ... otras claves necesarias
    ```

## ▶️ Ejecución

### Modo Desarrollo
Para iniciar el servidor backend y el frontend con recarga en caliente:
```bash
npm run dev
```
La aplicación estará disponible en `http://localhost:5173`.

### Con Docker 🐳
Para levantar toda la aplicación en un entorno aislado:
```bash
docker-compose up --build
```
La aplicación estará disponible en `http://localhost:3001`.

## 🧪 Tests y Calidad

*   **Unitarios:** `npm test`
*   **E2E (Playwright):** `npm run test:e2e`
*   **Linting:** `npm run lint`
*   **Accesibilidad:** `npm run ci:a11y`
*   **Rendimiento:** `npm run ci:lighthouse`

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.
