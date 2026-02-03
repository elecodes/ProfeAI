export * from './chat';
export * from './tts';
export * from './dialogue';
export * from './user';
export * from './lesson';

// Add other global types if needed
export interface User {
  uid: string;
  email: string;
  displayName?: string;
}
