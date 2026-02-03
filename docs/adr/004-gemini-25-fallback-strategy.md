# ADR 003: Migración a Gemini 2.5 y Estrategia de Fallback Secuencial

## Estatus
Aceptado

## Contexto
Durante las pruebas de carga y uso diario, se detectaron errores 429 (Too Many Requests) frecuentes tanto en los modelos Gemini 2.0/1.5 como en el fallback de OpenAI. Además, la estrategia inicial de "Model Racing" (lanzar múltiples peticiones en paralelo) duplicaba el consumo de cuota por cada mensaje del usuario, acelerando el agotamiento de los límites del Free Tier.

## Decisión
Hemos decidido realizar los siguientes cambios estructurales:
1.  **Migración a Gemini 2.5**: Adoptar `gemini-2.5-flash-lite` y `gemini-2.5-flash` como modelos primarios, aprovechando su mayor disponibilidad y eficiencia en 2026.
2.  **Fallback Secuencial**: Sustituir el "Racing" por un intento secuencial ordenado por eficiencia y costo: Gemini 2.5 Lite -> Gemini 2.5 Flash -> Gemini 1.5 Flash -> OpenAI.
3.  **Model Reporting**: Incluir el nombre del modelo activo en la respuesta de la API y loguearlo en la consola del frontend para facilitar la depuración y transparencia hacia el usuario.
4.  **Eliminación de Penalizaciones**: Remover los parámetros `presencePenalty` y `frequencyPenalty` en modelos GoogleAI para cumplir con las especificaciones de su API y evitar errores 400.

## Consecuencias
### Positivas
*   **Ahorro de Cuota**: Se reduce a la mitad el consumo de tokens por interacción.
*   **Mayor Estabilidad**: Menor probabilidad de fallos simultáneos por límites de rate-limit.
*   **Mejor DX**: Los desarrolladores pueden ver qué modelo está "vivo" directamente en la consola.

### Negativas
*   **Latencia**: En caso de fallo del primer modelo, la respuesta tardará unos milisegundos más debido a los reintentos secuenciales (aunque se compensa con la velocidad de la serie 2.5).
