# Arquitectura de ProfeAI

Este documento describe la arquitectura de alto nivel del sistema ProfeAI.

## Visión General
ProfeAI es una plataforma monorepo que separa claramente las responsabilidades entre el Frontend y el Backend.

## Componentes Principales
- **Frontend**: Aplicación React + Vite + TypeScript.
- **Backend**: API robusta construida con FastAPI (Python).
- **IA**: Integración con Google GenAI (Gemini) y otros modelos a través de Genkit.

## Estructura del Monorepo
```
ProfeAI/
├── backend/            # FastAPI Backend
├── frontend/           # React Frontend
├── docs/               # Documentación
└── package.json        # Configuración de Monorepo (Workspaces)
```

## Flujo de Datos
1. El usuario interactúa con el **Frontend**.
2. El frontend realiza peticiones a la **API (Backend)**.
3. El backend procesa la lógica, interactúa con **Firebase** para persistencia y **IA** para generación de contenido.
