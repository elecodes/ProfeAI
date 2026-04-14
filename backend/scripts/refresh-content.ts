import admin from 'firebase-admin';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { resolve } from 'path';
import fs from 'fs/promises';

// Parse command line arguments
const args = process.argv.slice(2);
const RESTORE_MODE = args.includes('--restore');
const BACKUP_MODE = args.includes('--backup') || !RESTORE_MODE; // Default: backup before update

// Manual .env loader to avoid ESM/CJS issues
function loadEnv() {
  const rootDir = resolve(process.cwd(), '..'); // Go up to root
  const envPath = resolve(rootDir, '.env');
  try {
    const content = require('fs').readFileSync(envPath, 'utf-8');
    content.split('\n').forEach((line: string) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > -1) {
          const key = trimmed.substring(0, eqIdx).trim();
          const value = trimmed.substring(eqIdx + 1).trim();
          process.env[key] = value;
        }
      }
    });
    console.log('✅ Loaded .env from:', envPath);
    console.log('🔑 API Key loaded:', process.env.GOOGLE_GENAI_API_KEY ? 'YES' : 'NO');
  } catch (e) {
    console.warn('⚠️ Could not load .env:', e);
  }
}

async function listAvailableModels(genAI: GoogleGenerativeAI) {
  try {
    // Note: The SDK might not expose listModels directly on the client in all versions, 
    // but usually it is available via the API or we can just try a standard one.
    // Actually, typical SDK usage doesn't have a simple listModels on the instance.
    // We will try a known working model 'gemini-pro' as a fallback test or just try 'models/gemini-1.5-flash-latest'.
    
    // Let's try to just use 'gemini-1.5-flash-latest' which is likely to exist if the alias is set, 
    // or 'gemini-1.5-flash-001'.
    
    console.log("🔍 Testing model 'gemini-1.5-flash-001'...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" });
    const result = await model.generateContent("Hello");
    console.log("✅ 'gemini-1.5-flash-001' works:", result.response.text());
    return "gemini-1.5-flash-001";
    
  } catch (e: any) {
     console.error("❌ 'gemini-1.5-flash-001' failed:", e.message);
     
     try {
        console.log("🔍 Testing model 'gemini-1.5-flash-latest'...");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const result = await model.generateContent("Hello");
        console.log("✅ 'gemini-1.5-flash-latest' works.");
        return "gemini-1.5-flash-latest";
     } catch (e2: any) {
        console.error("❌ 'gemini-1.5-flash-latest' failed:", e2.message);
        
        console.log("🔍 Testing model 'gemini-pro' (classic fallback)...");
        // Fallback to gemini-pro if all else fails
        return "gemini-pro";
     }
  }
}

async function generateNewContent(genAI: GoogleGenerativeAI) {
  // Only use models verified by the diagnostic tool. 
  const modelsToTry = [
    "googleai/gemini-flash-latest",
    "googleai/gemini-1.5-flash"
  ];

  const prompt = `
    Genera un JSON para actualizar mis lecciones de idiomas. Necesito 3 bloques principales: 'beginner', 'intermediate', 'advanced'.
    
    Cada nivel debe tener una temática gramatical distinta:
    1. 'beginner': Vocabulario básico y saludos de la vida diaria.
    2. 'intermediate': Tiempos verbales del pasado (pretérito e imperfecto) y futuro simple.
    3. 'advanced': Estructuras complejas como el condicional y el subjuntivo.
    
    Cada bloque debe ser un objeto con dos campos:
    1. "items": Un array de 5 frases. Cada frase debe tener:
       - "id": un string aleatorio corto (ej. hash).
       - "text": la frase en inglés.
       - "translation": la traducción al español.
    
    2. "quiz": Un array de 5 objetos (uno para cada frase anterior). Cada objeto debe tener:
       - "id": el mismo id que la frase correspondiente.
       - "question": La frase en inglés (o una pregunta sobre ella).
       - "options": Un array de 4 strings (la traducción correcta y 3 opciones incorrectas creíbles).
       - "correctAnswer": La traducción correcta.

    Ejemplo de estructura esperada (SOLO JSON PURO):
    {
      "beginner": {
        "items": [ { "id": "b1", "text": "Hello", "translation": "Hola" } ],
        "quiz": [ { "id": "b1", "question": "Hello", "options": ["Hola", "Adiós", "Perro", "Gato"], "correctAnswer": "Hola" } ]
      },
      "intermediate": { ... },
      "advanced": { ... }
    }
  `;

  console.log('⏳ Generating new content with Gemini...');
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  for (const modelName of modelsToTry) {
    console.log(`🤖 Attempting with model: ${modelName}`);
    
    try {
        const model = genAI.getGenerativeModel({ 
            model: modelName.replace('googleai/', ''),
            generationConfig: {
              responseMimeType: "application/json"
            }
        });

        const maxRetries = 3;
        for (let i = 0; i < maxRetries; i++) {
            try {
                const result = await model.generateContent(prompt);
                const text = result.response.text();
                const jsonString = text.replace(/```json\\n?|\\n?```/g, '').trim();
                const data = JSON.parse(jsonString);
                console.log(`✅ Content generated successfully with ${modelName}!`);
                return data;
            } catch (error: any) {
                const errorText = error.message || String(error);
                const isRateLimit = errorText.includes("429") || errorText.includes("Quota") || errorText.includes("limit");
                
                if (isRateLimit) {
                    // Very aggressive wait times for free tier: 45s, 90s, 120s
                    const waitTimes = [45000, 90000, 120000];
                    const waitTime = waitTimes[i] || 120000;
                    console.warn(`⚠️ Model ${modelName} hit rate limit (Attempt ${i + 1}/${maxRetries}). Waiting ${waitTime/1000}s...`);
                    await delay(waitTime); 
                } else {
                    console.error(`❌ Unexpected error using model ${modelName}:`, errorText);
                    break; 
                }
            }
        }
    } catch (e: any) {
        console.error(`❌ Failed to initialize model ${modelName}:`, e.message);
    }
    console.warn(`⏭️ Model ${modelName} exhausted. Trying next...`);
  }
  
  throw new Error("❌ Failed to generate content: All models hit rate limits. Usually this means the daily quota is exhausted.");
}

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

async function main() {
  // Load env first (needed for any mode)
  loadEnv();
  
  // Initialize Firebase Admin FIRST for any mode
  if (admin.apps.length === 0) {
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.log(`🔑 Using GOOGLE_APPLICATION_CREDENTIALS: ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`);
      admin.initializeApp();
    } else {
      try {
        const serviceAccount = require('../service-account.json');
        console.log('📄 Using local service-account.json');
        admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
      } catch (e) {
        console.warn('⚠️ Using default initialization...');
        admin.initializeApp();
      }
    }
  }
  
  if (RESTORE_MODE) {
  console.log('♻️ RESTORE MODE: Restoring from backup...');
  
  const db = admin.firestore();
  const levels = ['beginner', 'intermediate', 'advanced'];
  const batch = db.batch();
  
  for (const level of levels) {
    const backupRef = db.collection('lessons').doc(`${level}_general_backup`);
    const currentRef = db.collection('lessons').doc(`${level}_general`);
    
    try {
      const backupDoc = await backupRef.get();
      const data = backupDoc.data();
      if (data && data.id) {
        batch.set(currentRef, data, { merge: false });
        console.log(`♻️ Restoring ${level} from backup...`);
      } else {
        console.warn(`⚠️ No backup found for ${level}, skipping`);
      }
    } catch (e) {
      console.warn(`⚠️ Error restoring ${level}:`, e);
    }
  }
  
  await batch.commit();
  console.log('✅ Restore complete!');
  return;
}

if (!BACKUP_MODE) {
  console.log('💾 BACKUP MODE: Only creating backup (no update)');
} else {
  console.log('🚀 UPDATE MODE: Will update and create backup');
}
  
  // Load .env first
  loadEnv();
  
  // Initialize Google AI
  const apiKey = process.env.GOOGLE_GENAI_API_KEY;
  if (!apiKey) {
    console.error('❌ GOOGLE_GENAI_API_KEY is missing in environment variables.');
    process.exit(1);
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  console.log(`🤖 Google AI Client initialized (Key length: ${apiKey.length})`);
  
  try {
    // 1. Initialize Firebase Admin
    if (admin.apps.length === 0) {
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        console.log(`🔑 Using GOOGLE_APPLICATION_CREDENTIALS from environment: ${process.env.GOOGLE_APPLICATION_CREDENTIALS}`);
        admin.initializeApp();
      } else {
        try {
          // Fallback to local service-account.json relative to this script
          const serviceAccount = require('../service-account.json');
          console.log('📄 Using local service-account.json file.');
          admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
          });
        } catch (e) {
          console.warn('⚠️ No GOOGLE_APPLICATION_CREDENTIALS found and local service-account.json missing.');
          console.log('📡 Attempting default initialization (Application Default Credentials)...');
          admin.initializeApp();
        }
      }
    } else {
        console.log('🔥 Firebase Admin already initialized, skipping re-init.');
    }

    const db = admin.firestore();
    // Simple connection test
    const collections = await db.listCollections();
    console.log(`📚 Connected to Firestore. Found ${collections.length} root collections.`);

    // Generate content
    const newContent = await generateNewContent(genAI);
    
    // Log a preview of the content
    console.log('📦 LOGGING GENERATED CONTENT PREVIEW:');
    console.log(JSON.stringify(newContent, null, 2));

    // 3. Save to Firestore
    console.log('💾 Saving content to Firestore...');
    const batch = db.batch();
    
    // Iterate over levels (beginner, intermediate, advanced)
    for (const [level, content] of Object.entries(newContent)) {
        // Validation: verify structure
        const data = content as { items: any[], quiz: any[] };
        if (!data.items || !Array.isArray(data.items)) {
            console.warn(`⚠️ Unexpected format for level ${level} (missing items array), skipping.`);
            continue;
        }

        // Target the documents as requested (e.g., beginner_general)
        const docId = `${level}_general`; 
        const docRef = db.collection('lessons').doc(docId);
        const backupRef = db.collection('lessons').doc(`${level}_general_backup`);
        
        // First, backup current content BEFORE updating
        if (BACKUP_MODE) {
          const currentDoc = await docRef.get();
          const currentData = currentDoc.data();
          console.log(`🔍 Checking backup for ${level}:`, currentData ? 'has data' : 'empty');
          if (currentData) {
            batch.set(backupRef, currentData, { merge: false });
            console.log(`💾 Backed up current ${level} content`);
          }
        }
        
        const updateData = {
            id: docId, // Ensure ID is part of the doc
            title: `${level.charAt(0).toUpperCase() + level.slice(1)} - General Practice`,
            level: level,
            items: data.items.map((item: any) => ({
                id: item.id || Math.random().toString(36).substring(7),
                text: item.text,
                translation: item.translation
            })),
            quiz: data.quiz || [], 
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        // Use set with merge: false to completely replace the document
        batch.set(docRef, updateData, { merge: false });
        console.log(`✅ Documento ${docId} actualizado correctamente`);
    }

    await batch.commit();
    console.log('✅ All mutations committed to Firestore successfully.');

    console.log('✅ Initialization complete. Ready for logic implementation.');
    
  } catch (error: any) {
    console.error('❌ Error in main execution:', error);
    process.exit(1);
  }
}

main().catch(console.error);
