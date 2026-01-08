export interface ChatMessage {
  role: 'user' | 'ai' | 'system';
  content: string;
}

export interface ChatResponse {
  message: {
    text: string;
    gender: 'male' | 'female';
  };
}

export interface ChatRequest {
  topic: string;
  level: string;
  sessionId: string;
  message?: string;
}

export interface ConversationState {
  messages: ChatMessage[];
  isLoading: boolean;
  topic: string;
}
