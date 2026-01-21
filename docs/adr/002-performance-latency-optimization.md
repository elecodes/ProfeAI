# 2. Optimización de Rendimiento y Latencia

Fecha: 2026-01-21

## Estatus
Aceptado

## Contexto
Los usuarios reportaban una experiencia de "carga lenta" tanto en la navegación inicial de la aplicación como en las respuestas del chat de IA (modo "Conversar"). Al estar limitados por el "Free Tier" de los proveedores de IA (Google Gemini, OpenAI), la latencia de respuesta era significativa, afectando la percepción de fluidez.

## Decisión

Hemos decidido implementar una estrategia de optimización en dos frentes: **Carga Progresiva (UX)** y **Reducción de Latencia (AI)**.

### 1. Carga Progresiva (Frontend)
- **Lazy Loading**: Implementación de `React.lazy` para dividir el código de las páginas principales (`ChatPage`, `ProfilePage`, etc.) en chunks separados.
- **Skeleton Screens**: Reemplazo de los spinners de carga genéricos por "esqueletos" (UI placeholders) que imitan el diseño final, reduciendo el "Layout Shift" y mejorando la percepción de velocidad.

### 2. Optimización de Latencia IA (Backend/Genkit)
- **Prompt Minification**: Se redujo el tamaño de los prompts del sistema ("Mateo") en un ~60%, eliminando ejemplos redundantes y simplificando instrucciones. Menos tokens de entrada = menor tiempo de procesamiento (Time To First Token).
- **Model Racing (Carrera de Modelos)**: En lugar de un "fallbck en cascada" (probar A, esperar error, probar B), ahora ejecutamos dos modelos rápidos en paralelo (`Flash Lite 001` y `Flash Lite Standard`) usando `Promise.any()`. Se utiliza la respuesta del primero que termine.
- **Zero-Delay Retry**: Se eliminaron las esperas artificiales (2s, 5s) entre reintentos. Si un modelo falla por cuota (429), el sistema salta inmediatamente al siguiente.

### 3. Seguridad (CSP)
- Se ajustaron las políticas CSP (`server.ts` e `index.html`) para permitir recursos necesarios (`storage.googleapis.com` para imágenes de ElevenLabs, `apis.google.com` para scripts) y marcos de autenticación (`*.firebaseapp.com`).

## Consecuencias
- **Positivas**:
    - La carga inicial de la app es más ligera.
    - La latencia percibida en el chat se ha reducido drásticamente gracias al "Racing".
    - Mayor robustez ante fallos de API en el tier gratuito.
- **Negativas**:
    - El "Model Racing" duplica el consumo de cuota (requests) en cada turno de conversación, lo que podría agotar el límite diario más rápido. (Aceptable dado que son modelos gratuitos/baratos y la prioridad es la velocidad).
