# Documentación de la API

Este documento detalla los endpoints disponibles en la API de ProfeAI.

## Base URL
- Desarrollo: `http://localhost:8000/api/v1`
- Producción: `https://api.profeai.com/api/v1` (Ejemplo)

## Endpoints

### Autenticación
- `POST /auth/login`: Iniciar sesión.
- `POST /auth/register`: Registrar nuevo usuario.

### Lecciones y Contenido
- `GET /lessons`: Listar lecciones.
- `POST /lessons/generate`: Generar una nueva lección usando IA.

## Especificación OpenAPI
La documentación interactiva (Swagger) está disponible en `/docs` una vez que el backend está corriendo.
