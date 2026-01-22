import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ConversationService from '../../services/ConversationService';

// Mock genkit
const mockTutorFlow = vi.fn();
vi.mock('../../lib/genkit', () => ({
    tutorFlowGemini: vi.fn((...args) => mockTutorFlow(...args))
}));

// Mock LangChain History
const mockGetMessages = vi.fn().mockResolvedValue([]);
const mockAddUserMessage = vi.fn().mockResolvedValue(undefined);
const mockAddAIMessage = vi.fn().mockResolvedValue(undefined);

// Define a minimal Mock History class
class MockHistory {
    getMessages = mockGetMessages;
    addUserMessage = mockAddUserMessage;
    addAIMessage = mockAddAIMessage;
}

vi.mock('@langchain/core/chat_history', () => ({
    InMemoryChatMessageHistory: vi.fn(function() {
        return {
            getMessages: mockGetMessages,
            addUserMessage: mockAddUserMessage,
            addAIMessage: mockAddAIMessage
        };
    })
}));

describe('ConversationService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset Singleton State
        (ConversationService as any).messageHistories = new Map();
        (ConversationService as any).lastRateLimitTimestamp = 0;
        
        mockGetMessages.mockResolvedValue([]);
    });

    describe('startConversation', () => {
        it('should initialize history and generate response', async () => {
             const mockResponse = { text: 'Hola', gender: 'female' };
             mockTutorFlow.mockResolvedValueOnce(mockResponse);
             
             const res = await ConversationService.startConversation('sess1', 'Travel', 'beginner');
             
             expect(res).toEqual(mockResponse);
             expect(mockTutorFlow).toHaveBeenCalled();
             expect((ConversationService as any).messageHistories.has('sess1')).toBe(true);
        });
    });

    describe('sendMessage', () => {
        it('should trigger Spanglish check', async () => {
             // "I want water" -> "want", "water" in vocab map
             // Spanglish detector should catch "want" -> "quiero"
             const res = await ConversationService.sendMessage('sess1', 'I want water', 'topic', 'level');
             
             expect(res.text).toContain('He notado que usaste "want"');
             expect(mockTutorFlow).not.toHaveBeenCalled();
        });

        it('should trigger Grammar check (Infinitive)', async () => {
             const res = await ConversationService.sendMessage('sess1', 'Yo comer pizza', 'topic', 'level');
             
             expect(res.text).toContain('Parece que usaste el verbo en infinitivo');
             expect(mockTutorFlow).not.toHaveBeenCalled();
        });

        it('should call Gemini if input is valid', async () => {
             const mockResponse = { text: '¡Qué bien!', gender: 'female' };
             mockTutorFlow.mockResolvedValueOnce(mockResponse);
             
             const res = await ConversationService.sendMessage('sess1', 'Me gusta la pizza', 'Food', 'beginner');
             
             expect(res).toEqual(mockResponse);
             expect(mockTutorFlow).toHaveBeenCalled();
             
             // Verify history recording
             expect(mockAddUserMessage).toHaveBeenCalledWith('Me gusta la pizza');
             expect(mockAddAIMessage).toHaveBeenCalledWith('¡Qué bien!');
        });
        
        it('should handle rate limiting (Circuit Breaker)', async () => {
            // Force rate limit state
            (ConversationService as any).lastRateLimitTimestamp = Date.now();
            
            await expect(ConversationService.sendMessage('sess1', 'Hola', 'topic', 'level'))
                .rejects.toThrow('El sistema está descansando');
                
            expect(mockTutorFlow).not.toHaveBeenCalled();
        });


         it('should throw if Gemini returns null/empty', async () => {
             mockTutorFlow.mockResolvedValueOnce(null);
             
             await expect(ConversationService.sendMessage('sess1', 'Hola', 'topic', 'level'))
                 .rejects.toThrow('Empty Response from Gemini');
         });
    });

    describe('getHistory', () => {
        it('should return existing history or create new', () => {
             const h1 = ConversationService.getHistory('new-sess');
             expect(h1).toBeDefined();
             
             const h2 = ConversationService.getHistory('new-sess');
             expect(h2).toBe(h1); // Same instance
        });
    });
});
