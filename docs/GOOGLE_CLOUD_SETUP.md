# Google Cloud Text-to-Speech Setup Guide

Esta guía te ayudará a configurar Google Cloud Text-to-Speech para obtener **4 millones de caracteres gratuitos al mes**.

## 📋 Requisitos

- Una cuenta de Google (Gmail)
- Tarjeta de crédito/débito (para verificación, **no se cobrará nada** en el tier gratuito)

## 🚀 Pasos de Configuración

### 1. Crear Cuenta de Google Cloud

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Haz clic en **"Comenzar gratis"** o **"Start Free"**
3. Inicia sesión con tu cuenta de Google
4. Completa el registro:
   - Selecciona tu país
   - Acepta los términos de servicio
   - Ingresa información de facturación (solo para verificación)

> [!NOTE]
> Google Cloud ofrece **$300 USD de crédito gratuito** para nuevos usuarios, además del tier gratuito permanente.

### 2. Crear un Proyecto

1. En la consola, haz clic en el selector de proyectos (arriba a la izquierda)
2. Clic en **"Nuevo Proyecto"** / **"New Project"**
3. Dale un nombre a tu proyecto (ej: `apptutor-tts`)
4. Haz clic en **"Crear"** / **"Create"**
5. Espera unos segundos y selecciona el proyecto creado

### 3. Habilitar la API de Text-to-Speech

1. En el menú lateral, ve a **"APIs y servicios"** → **"Biblioteca"**
2. Busca **"Cloud Text-to-Speech API"**
3. Haz clic en la API
4. Presiona **"Habilitar"** / **"Enable"**
5. Espera a que se active (toma unos segundos)

### 4. Crear Credenciales (Service Account)

1. Ve a **"APIs y servicios"** → **"Credenciales"**
2. Haz clic en **"Crear credenciales"** → **"Cuenta de servicio"**
3. Completa el formulario:
   - **Nombre**: `apptutor-tts-service`
   - **ID**: se genera automáticamente
   - **Descripción**: `Service account for AppTutor TTS`
4. Haz clic en **"Crear y continuar"**
5. En **"Otorgar acceso a este proyecto"**:
   - Selecciona el rol: **"Cloud Text-to-Speech User"**
   - Haz clic en **"Continuar"**
6. Haz clic en **"Listo"**

### 5. Descargar la Clave JSON

1. En la lista de cuentas de servicio, encuentra la que acabas de crear
2. Haz clic en los **tres puntos** (⋮) a la derecha
3. Selecciona **"Administrar claves"** / **"Manage keys"**
4. Haz clic en **"Agregar clave"** → **"Crear clave nueva"**
5. Selecciona **"JSON"** como tipo de clave
6. Haz clic en **"Crear"**
7. Se descargará automáticamente un archivo JSON

> [!IMPORTANT]
> **¡Guarda este archivo en un lugar seguro!** No lo compartas ni lo subas a GitHub.

### 6. Configurar las Variables de Entorno

#### Opción 1: Usar archivo de credenciales (Recomendado)

1. Mueve el archivo JSON descargado a una ubicación segura:
   ```bash
   # Ejemplo: crear carpeta para credenciales
   mkdir -p ~/.google-cloud
   mv ~/Downloads/apptutor-tts-*.json ~/.google-cloud/apptutor-credentials.json
   ```

2. Edita tu archivo `.env` en el proyecto:
   ```bash
   GOOGLE_APPLICATION_CREDENTIALS=/Users/tu-usuario/.google-cloud/apptutor-credentials.json
   ```

#### Opción 2: Usar credenciales inline

Si prefieres no usar un archivo separado, puedes extraer las credenciales del JSON:

1. Abre el archivo JSON descargado
2. Copia los valores de:
   - `project_id`
   - `private_key`
   - `client_email`

3. Agrégalos a tu `.env`:
   ```bash
   GOOGLE_CLOUD_PROJECT_ID=tu-project-id
   GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   GOOGLE_CLOUD_CLIENT_EMAIL=apptutor-tts-service@tu-project.iam.gserviceaccount.com
   ```

### 7. Verificar la Configuración

1. Reinicia tu servidor:
   ```bash
   npm start
   ```

2. Deberías ver en la consola:
   ```
   ✅ Google Cloud TTS initialized
   🔊 TTS Provider Status: { elevenlabs: true, google: true, webSpeech: true }
   ```

3. Prueba el endpoint de estado:
   ```bash
   curl http://localhost:3001/tts/status
   ```

## 💰 Límites del Tier Gratuito

| Característica | Límite Gratuito |
|----------------|-----------------|
| **Caracteres/mes** | 4,000,000 (4 millones) |
| **Voces Standard** | Incluidas |
| **Voces WaveNet** | Incluidas |
| **Voces Neural2** | Incluidas |
| **Idiomas** | Todos los disponibles |

> [!TIP]
> El límite se resetea el primer día de cada mes. Puedes monitorear tu uso en la [consola de Google Cloud](https://console.cloud.google.com/apis/api/texttospeech.googleapis.com/quotas).

## 🔒 Seguridad

> [!CAUTION]
> **Nunca subas el archivo de credenciales a GitHub o repositorios públicos.**

Asegúrate de que tu `.gitignore` incluya:
```
.env
*.json
!package.json
!package-lock.json
.google-cloud/
```

## 🆘 Solución de Problemas

### Error: "Google Cloud TTS initialization failed"

- Verifica que la ruta del archivo JSON sea correcta
- Asegúrate de que el archivo JSON tenga permisos de lectura
- Confirma que la API esté habilitada en tu proyecto

### Error: "Permission denied"

- Verifica que la cuenta de servicio tenga el rol "Cloud Text-to-Speech User"
- Regenera las credenciales si es necesario

### Error: "Quota exceeded"

- Revisa tu uso en la consola de Google Cloud
- El límite gratuito es de 4M caracteres/mes
- El sistema automáticamente hará fallback a Web Speech API

## 📚 Recursos Adicionales

- [Documentación oficial de Google Cloud TTS](https://cloud.google.com/text-to-speech/docs)
- [Precios y límites](https://cloud.google.com/text-to-speech/pricing)
- [Voces disponibles](https://cloud.google.com/text-to-speech/docs/voices)

## ✅ Siguiente Paso

Una vez configurado, el sistema usará automáticamente:
1. **ElevenLabs** (si hay créditos disponibles)
2. **Google Cloud TTS** (si ElevenLabs falla o se queda sin créditos)
3. **Web Speech API** (fallback final en el navegador)

¡Disfruta de tus 4 millones de caracteres gratuitos al mes! 🎉
