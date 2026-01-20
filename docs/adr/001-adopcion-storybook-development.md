# ADR 001: Adopción de Storybook y Mocking para Desarrollo UI

**Fecha**: 2026-01-20
**Estado**: Aceptado

## Contexto
El desarrollo de la interfaz de usuario (UI) en ProfeAI es lento debido a la dependencia de componentes complejos (`ConversationMode`, `DialogueGenerator`) que requieren conexión con el backend y servicios externos (OpenAI, Google TTS).
Además, cada prueba manual consume cuota de API, lo que incrementa los costos y el riesgo de alcanzar límites de tasa (Rate Limiting).
Se requiere un entorno aislado para desarrollar y validar componentes visuales sin depender de la infraestructura completa.

## Opciones Consideradas
1. **Desarrollo directo en la App**: Continuar desarrollando dentro de la aplicación principal.
2. **Storybook con Componentes Puros**: Refactorizar todo para que sea "pure" y usar Storybook solo para componentes simples.
3. **Storybook con Mocking de API**: Usar Storybook para todo, interceptando las llamadas `fetch` en componentes complejos para simular el backend.

## Decisión
Elegimos **Opción 3: Storybook con Mocking de API**.

## Justificación
Esta opción ofrece el mejor balance entre velocidad y realismo:
- **Aislamiento**: Permite trabajar en la UI incluso si el backend está caído.
- **Costos Cero**: No consume créditos de OpenAI/Google durante el desarrollo visual.
- **Estados Difíciles**: Podemos simular errores, cargas infinitas o respuestas específicas (ej. correcciones gramaticales) que son difíciles de reproducir manualmente.
- **DX (Experiencia de Desarrollo)**: Feedback visual instantáneo sin recargar toda la app ni navegar hasta la pantalla específica.

## Consecuencias
### Positivas
- Reducción drástica del tiempo de iteración en UI.
- Eliminación de costos de API durante el desarrollo de frontend.
- Documentación viva de los componentes en `src/stories`.

### Negativas
- Mantenimiento adicional: Los mocks en las stories deben actualizarse si la API del backend cambia.
- Riesgo de "falsos positivos": Un componente puede funcionar en Storybook (con mock) pero fallar en producción si el mock no es fiel a la realidad.

## Referencias
- [Documentación oficial de Storybook](https://storybook.js.org/)
- Commit de implementación inicial: `feat: setup storybook and add stories for core components`
