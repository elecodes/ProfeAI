export * from './chat';
export * from './tts';

// Add other global types if needed
export interface User {
  uid: string;
  email: string;
  displayName?: string;
}
