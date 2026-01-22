# 3. Estrategia de Testing "Core First"

Fecha: 2026-01-22

## Estado

Aceptado

## Contexto

El proyecto AppTutor es una aplicación crítica donde la confianza del usuario depende de la fiabilidad de servicios externos (IA, TTS, Base de Datos). Anteriormente, la cobertura de tests era baja (~2%) y fragmentada.

## Decisión

Adoptamos una estrategia de **"Core Service Coverage"** con los siguientes mandatos:

1.  **Cobertura del 100% en Servicios**: Todos los archivos en `src/services/` deben tener un 100% de cobertura de líneas, ramas y funciones.
    *   *Justificación*: Estos servicios encapsulan la lógica de negocio, manejo de errores de proveedores externos (ElevenLabs, Polly, Google) y persistencia de datos (Firestore). Cualquier fallo aquí es crítico.
    
2.  **Mocking Estricto**: Se deben usar mocks deterministas para todos los proveedores externos durante los tests unitarios. No se permiten llamadas reales a API en tests unitarios para garantizar velocidad y evitar costes.

3.  **Quality Gate en CI/CD**: Se ha implementado un script `npm run test:coverage:check` que falla si el directorio `src/services/` baja del 100% de cobertura.

## Consecuencias

*   **Positivas**:
    *   Mayor confianza al refactorizar servicios críticos.
    *   Detección temprana de errores en lógica de fallback (ej. TTS falla -> Google).
    *   Documentación viva del comportamiento esperado de los servicios.
*   **Negativas**:
    *   Mayor tiempo de desarrollo inicial para escribir tests exhaustivos.
    *   Necesidad de mantener mocks actualizados si cambian las APIs externas.
