# ADR 009: Alineación de Contenido y Proyectos (Sync Consistency)

## Estado
Aprobado

## Contexto
Durante la actualización de contenidos para el nivel "Avanzado", se identificó un problema crítico de sincronización: el frontend estaba configurado para el proyecto Firebase `apptutor-a4230`, mientras que los scripts de seeding y las credenciales del sistema utilizaban el proyecto `apptutor-v2`.

Esto causaba una discrepancia donde los cambios se aplicaban exitosamente en la base de datos de "v2", pero eran invisibles para el usuario ya que su aplicación seguía consumiendo datos antiguos de "a4230".

## Decisión
Hemos decidido estandarizar la configuración del entorno para garantizar que el frontend y el backend operen siempre sobre la misma instancia de Firebase:

1.  **Unificación de Credenciales**: Se ha movido el proyecto activo a `apptutor-a4230` de forma definitiva.
2.  **Gestión de Cuentas de Servicio**: La cuenta de servicio para seeding debe coincidir exactamente con el `VITE_FIREBASE_PROJECT_ID` configurado en el frontend.
3.  **Localización de Llaves**: Las llaves de cuenta de servicio (`service-account.json`) se almacenarán en la raíz del proyecto (ignoradas por Git) y su ruta se definirá en el `.env` mediante `GOOGLE_APPLICATION_CREDENTIALS`.
4.  **Procedimiento de Limpieza (Purge)**: Ante discrepancias de contenido, se priorizará el script `clear-and-seed` que borra la colección antes de re-subir, para evitar documentos huérfanos con IDs incorrectos.

## Consecuencias
- **Positivas**:
    - Sincronización garantizada entre lo que se ve en la web y lo que hay en Firestore.
    - Menor riesgo de "datos fantasma" (ghost data) por documentos mal nombrados.
    - Facilidad para rotar o cambiar de proyecto Firebase simplemente actualizando el `.env` y la cuenta de servicio en un solo lugar.
- **Riesgos**:
    - El script de `clear-and-seed` es destructivo; debe usarse con precaución y solo cuando la fuente de verdad (JSON locales) sea la correcta.
