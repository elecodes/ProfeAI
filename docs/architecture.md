# Arquitectura de ProfeAI

Este documento describe la arquitectura de alto nivel del sistema ProfeAI.

## Visión General
ProfeAI es una plataforma monorepo que separa claramente las responsabilidades entre el Frontend y el Backend utilizando **npm workspaces**.

## Componentes Principales
- **Frontend**: Aplicación React + Vite + TypeScript. Gestión de estado global con **AuthContext (Context API)**, hooks y Tailwind CSS.
- **Backend**: API robusta construida con **Node.js + Express** (Migrada desde FastAPI). Utiliza TypeScript y `tsx` para la ejecución.
- **IA (Orquestación)**: Integración con **Google GenAI (Gemini 2.5)** y OpenAI a través de **Google Genkit**.
- **Servicios de Voz**: Sistema multi-proveedor (ElevenLabs, Google, AWS) con lógica de fallback automática.

## Estructura del Monorepo
```
ProfeAI/
├── backend/            # Express Backend (Node.js/TypeScript)
│   ├── src/            # Código fuente (Servicios, Rutas, Lib)
│   └── package.json    # Dependencias del servidor
├── frontend/           # React Frontend (Vite)
│   ├── src/            # Componentes, Hooks, Páginas
│   └── package.json    # Dependencias del cliente
├── docs/               # Documentación técnica y ADRs
└── package.json        # Configuración de Monorepo (Workspaces)
```

## Flujo de Datos y Resiliencia
1. El usuario interactúa con el **Frontend**.
2. El frontend realiza peticiones a la **API (Backend)** bajo el prefijo `/api/v1`.
3. El backend procesa la lógica mediante **Servicios** especializados.
4. **Resiliencia de IA**: Se implementa una **Estrategia Secuencial** (Gemini 2.5 Lite -> Flash -> 1.5 -> OpenAI) para manejar límites de cuota (429) y garantizar disponibilidad.
5. Los datos se persisten en **Firebase Firestore** y la autenticación se gestiona con **Firebase Auth**.
## Despliegue y Hosting
- **URL Producción**: [https://profeai.onrender.com/](https://profeai.onrender.com/)
- **Infraestructura**: Despliegue unificado en **Render** mediante un único **Dockerfile**.
- **SSL y DNS**: Gestionados automáticamente por la plataforma Render.
- **CI/CD**: Flujo de despliegue continuo integrado con GitHub para actualizaciones automáticas en `main`.
