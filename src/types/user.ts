export interface LearnedPhrase {
  id?: string;
  original: string;
  translation: string;
  dateLearned: string;
  context?: string;
}

export interface StudySession {
  id?: string;
  date: string;
  duration?: number; // in minutes
  topic?: string; // e.g. "Restaurant", "Grammar"
  score?: number;
  type: 'conversation' | 'quiz' | 'flashcards';
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: boolean;
  [key: string]: any;
}

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: any; // Firestore Timestamp or Date
  lastActive: any; // Firestore Timestamp or Date
  level: 'beginner' | 'intermediate' | 'advanced';
  learnedPhrases: LearnedPhrase[];
  history: StudySession[];
  preferences: UserPreferences;
  [key: string]: any; // Allow for other fields
}
