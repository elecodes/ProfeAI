import process from 'node:process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { db, auth } from '../src/lib/firebase.ts';
import { doc, setDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

// Load .env from root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const LESSONS_DIR = path.join(__dirname, '../../frontend/src/lessons');

async function authenticate() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("❌ ADMIN_EMAIL or ADMIN_PASSWORD missing in .env");
    process.exit(1);
  }

  try {
    console.log("🔐 Attempting to sign in...");
    await signInWithEmailAndPassword(auth, email, password);
    console.log("✅ Signed in as admin.");
  } catch (error) {
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
      console.log("⚠️ User not found, creating admin user...");
      try {
        await createUserWithEmailAndPassword(auth, email, password);
        console.log("✅ Admin user created and signed in.");
      } catch (createError) {
        console.error("❌ Failed to create admin user:", createError);
        throw createError;
      }
    } else {
      console.error("❌ Authentication failed:", error);
      throw error;
    }
  }
}

async function seedLessons() {
  console.log('🌱 Starting seed process...');

  try {
    await authenticate();

    const levels = ['beginner', 'intermediate', 'advanced'];

    for (const level of levels) {
      const levelDir = path.join(LESSONS_DIR, level);
      
      try {
        await fs.access(levelDir);
      } catch {
        console.log(`Skipping ${level} (directory not found)`);
        continue;
      }

      const files = await fs.readdir(levelDir);
      
      for (const file of files) {
        if (!file.endsWith('.json')) continue;

        const filePath = path.join(levelDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const lessonData = JSON.parse(content);
        
        const lessonId = `${level}_${file.replace('.json', '')}`;
        
        // Add metadata
        const docData = {
          ...lessonData,
          level: level,
          weekName: lessonData.title || file.replace('.json', ''),
          file: file,
          items: lessonData.sentences || []
        };

        console.log(`Uploading ${lessonId}...`);
        await setDoc(doc(db, 'lessons', lessonId), docData);
      }
    }

    console.log('✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedLessons();
