# ADR 008: Migración a Despliegue en Render (Docker Unificado)

## Estado
Aprobado

## Contexto
Originalmente, el proyecto contemplaba un despliegue basado en `docker-compose` con Nginx como proxy inverso y gestión manual de certificados SSL (vía `init-letsencrypt.sh`). Esto introducía complejidad en la orquestación y mantenimiento, especialmente para entornos gratuitos o de bajo coste.

Se buscaba una solución de despliegue que:
1. Fuera compatible con el modelo de **Capa Gratuita** (Free Tier).
2. Simplificara la gestión de SSL y DNS.
3. Permitiera un despliegue unificado de un Monorepo (Frontend + Backend).

## Decisión
Hemos decidido migrar el despliegue principal a **Render**, utilizando su arquitectura de **Web Service (Docker)**.

Los pilares de esta configuración son:
1. **Docker unificado**: Un único `Dockerfile` en la raíz que compila el frontend (React/Vite) y lo sirve estáticamente desde el backend (Express/Node.js). El Dockerfile incorpora hardening mediante `apk upgrade` y actualizaciones de `npm` para mitigar vulnerabilidades base.
2. **Inyección de variables en Build-time**: Debido a que Vite embebe las variables `VITE_*` durante el empaquetado, el Dockerfile crea un archivo `.env` dinámico usando `ARG` pasados por Render.
3. **Gestión de Transitorias**: Uso de `overrides` en el `package.json` raíz para forzar versiones seguras de dependencias indirectas (ej: `qs`) identificadas por Snyk.
4. **Optimización de arranque**: Uso de `tsx` en el backend para ejecutar directamente TypeScript en producción, simplificando el flujo de compilación.
5. **Seguridad Adaptativa**: Configuración de Helmet ajustada para permitir WebSockets de ElevenLabs y Popups de Firebase Auth (`Cross-Origin-Opener-Policy`).

## Consecuencias
- **Positivas**:
    - SSL automático gestionado por Render.
    - Despliegue continuo (CD) automático al hacer push a `main`.
    - Eliminación de la dependencia de Nginx y scripts complejos de certificados.
    - Soporte nativo para el modo "Spin down" (ahorro de cuota).
- **Negativas/Riesgos**:
    - Tiempo de arranque inicial más lento (Cold start) en el Free Tier.
    - Necesidad de pasar todas las variables de entorno como ARGs de Docker durante el build.

## Alternativas Consideradas
- **Railway**: Descartado por el fin de sus créditos gratuitos permanentes.
- **Vercel/Netlify**: Descartados por la necesidad de ejecutar un backend de Node.js persistente y complejo (Genkit).
