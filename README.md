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
*   **✅ Seguimiento de Progreso:** Visualiza tu avance por semanas y niveles (con opción de reinicio completo).
*   **♿ Accesibilidad y Heurística (UX):**
    *   **Navegación por Teclado:** Uso completo sin ratón (Tab, Enter, Escape).
    *   **Lectores de Pantalla:** Etiquetas ARIA descriptivas en todos los botones.
    *   **Indicadores de Estado:** Animaciones de "Pensando..." durante la generación de IA para reducir la espera percibida.
*   **⚡ Rendimiento Avanzado:**
    *   **Lazy Loading:** Carga progresiva de páginas para un inicio instantáneo.
    *   **AI Model Reporting:** El sistema informa en consola exactamente qué modelo está respondiendo (ej: "Gemini 2.5 Flash Lite").
    *   **Estrategia Accionable:** Uso de **Gemini 2.5 Flash Lite** con **Sequential Fallback** a Gemini 2.5 Flash y Gemini 1.5 para maximizar la disponibilidad y ahorrar cuota.
*   **🔐 Autenticación Profesional (Sincronizada):**
    *   **Estado Global (Unified Auth):** Implementado con Context API para asegurar una sesión única en toda la app.
    *   **Recuérdame:** Soporte real para persistencia de sesión (`LOCAL` vs `SESSION`).
    *   **Recuperación de Contraseña:** Flujo completo de recuperación vía email.
    *   **Login con Google:** Acceso rápido y seguro con un solo clic.
    *   **Validación Estricta:** Registro seguro y detección inteligente de cuentas existentes.

## 🛠️ Tecnologías y Estructura (Monorepo)

El proyecto está organizado como un **npm workspace** para separar claramente las responsabilidades:

- **Frontend (`/frontend`)**: React, Vite, Tailwind CSS.
- **Backend (`/backend`)**: Node.js, Express, **Helmet.js**, Genkit.

### Integraciones Externas
- **Base de Datos**: Firebase Firestore & Authentication.
- **IA & Servicios**: LangChain, **Genkit**, OpenAI, Gemini 2.5, Amazon Polly, Google Cloud TTS, ElevenLabs, **Tavily**.
- **Calidad**: Sentry, Playwright, Vitest, Lighthouse.

## 🚀 Instalación y Uso

1.  **Instalar dependencias (desde la raíz):**
    ```bash
    npm install
    ```

2.  **Configurar variables de entorno:**
    Crea un archivo `.env` en la raíz (ver `.env.example`).

3.  **Ejecución con Scripts de Workspace:**
    - `npm run dev`: Lanza frontend y backend simultáneamente.
    - `npm run frontend:dev`: Inicia solo el cliente web.
    - `npm run backend:dev`: Inicia solo el servidor API.

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
*   **Documentación:** `npm run doc` (Genera documentación técnica con TypeDoc en `docs/api`)
135: 
136: ### 🛡️ Estrategia de Testing "Core First"
137: 
138: Este proyecto sigue una estrategia de calidad estricta pero pragmática:
139: *   **Core Services (100%)**:  La lógica de negocio (`src/services/`) debe tener una cobertura del 100%. Esto incluye `UserService`, `LessonService`, `TTSService`, `GrammarService`, `DialogueGenerator` y `ConversationService`.
140: *   **Global Threshold (80%)**: El objetivo general del proyecto es mantener un 80% de cobertura.
141: *   **Verificación Automática**: Ejecuta `npm run test:coverage:check` antes de cada push para asegurar que no se introducen regresiones.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.
