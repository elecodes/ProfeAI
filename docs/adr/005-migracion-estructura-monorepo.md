# ADR 005: Migración a Estructura de Monorepo

## Estatus
Aceptado

## Contexto
Originalmente, el proyecto tenía una estructura plana donde el código del frontend y el backend coexistían en gran medida en la raíz o en carpetas compartidas de forma ambigua. Esto causaba conflictos de dependencias (Node.js vs Browser), dificultades en la configuración de herramientas de build (Vite vs Express) y complicaciones en el despliegue mediante Docker.

## Decisión
Hemos migrado el proyecto a una estructura de **Monorepo** basada en npm workspaces:
1.  **frontend/**: Contiene la aplicación React + Vite completa.
2.  **backend/**: Contiene el servidor Express configurado con TypeScript (tsx).
3.  **Configuración Raíz**: Un `package.json` en la raíz gestiona los workspaces y proporciona scripts de conveniencia (`npm run frontend:dev`, `npm run backend:dev`).
4.  **Aislamiento de Dependencias**: Cada workspace tiene su propio `package.json` y `node_modules` (aunque npm optimiza esto en la raíz), permitiendo versiones de paquetes específicas para cada entorno.

## Consecuencias
### Positivas
*   **Claridad Arquitectónica**: Separación clara de responsabilidades (Frontend vs Backend).
*   **Despliegue Simplificado**: Cada Dockerfile reside en su respectiva carpeta y solo copia lo necesario.
*   **Mejor DX**: Menos errores de linting y tipado por mezclar entornos de ejecución distintos.
*   **Escalabilidad**: Facilita la adición de futuros microservicios o paquetes compartidos.

### Negativas
*   **Complejidad Inicial**: Requiere acostumbrarse a ejecutar comandos con `-w` o desde la raíz usando los scripts delegados.
*   **Gestión de Rutas**: Las referencias a archivos de configuración (Firebase, .env) han sido ajustadas para las nuevas profundidades de directorio.
