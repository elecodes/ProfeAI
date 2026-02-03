# ADR 006: Gestión de Estado de Autenticación Unificado (AuthContext)

## Estado
Aprobado

## Contexto
Originalmente, la lógica de autenticación estaba dispersa y cada componente que utilizaba el hook `useAuth` creaba su propio listener de `onAuthStateChanged`. Esto causaba:
1.  **Conflictos de Estado**: Diferentes componentes veían diferentes estados del usuario simultáneamente.
2.  **Inconsistencia en "Recuérdame"**: Las preferencias de persistencia de Firebase chocaban entre sí.
3.  **Redundancia**: Múltiples peticiones a Firestore para cargar el mismo perfil de usuario.

## Decisión
Hemos implementado un `AuthProvider` global utilizando la Context API de React. 

**Cambios clave**:
- El listener de Firebase `onAuthStateChanged` vive ahora exclusivamente en el `AuthProvider`.
- Se centraliza la carga del perfil del usuario (`userProfile`) desde Firestore.
- El hook `useAuth` ahora consume este contexto global en lugar de crear lógica interna.

## Consecuencias

### Positivas
- **Single Source of Truth**: Toda la aplicación reacciona de forma atómica a los cambios de sesión.
- **Rendimiento**: Se reduce drásticamente el número de llamadas a Firebase.
- **Estabilidad**: La persistencia de sesión ("Recuérdame") es ahora robusta y predecible.

### Negativas
- Añade una ligera complejidad al árbol de componentes (Provider injection).
- Requiere que el hook `useAuth` se use dentro del contexto del Provider (error-safe check añadido).
