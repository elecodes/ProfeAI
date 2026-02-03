import process from 'node:process';
import { db } from '../firebase/firebase.js';
import { collection, getDocs } from 'firebase/firestore';

async function testConnection() {
  console.log('Testing Firestore connection...');
  try {
    const col = collection(db, 'lessons');
    const snapshot = await getDocs(col);
    console.log('Connection successful. Documents:', snapshot.size);
    process.exit(0);
  } catch (error) {
    console.error('Connection failed:', error);
    process.exit(1);
  }
}

testConnection();
