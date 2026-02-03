import { describe, it, expect, vi, beforeEach } from 'vitest';
import DialogueGenerator from '../../services/DialogueGenerator';

// Mock genkit
const mockDialogueFlow = vi.fn();

vi.mock('../../lib/genkit', () => ({
    dialogueFlow: vi.fn((...args) => mockDialogueFlow(...args))
}));

describe('DialogueGenerator', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should generate a dialogue with ID', async () => {
        const mockResponse = {
            title: 'Test Dialogue',
            lines: [{ speaker: 'A', text: 'Hola', translation: 'Hello' }],
            difficulty: 'beginner'
        };
        
        mockDialogueFlow.mockResolvedValueOnce(mockResponse);
        
        const result = await DialogueGenerator.generate('Restaurant', 'beginner');
        
        expect(mockDialogueFlow).toHaveBeenCalledWith({
            topic: 'Restaurant',
            level: 'beginner'
        });
        
        expect(result).toEqual(expect.objectContaining({
            ...mockResponse,
            id: expect.stringMatching(/^gen_\d+$/)
        }));
    });

    it('should handle errors', async () => {
        mockDialogueFlow.mockRejectedValueOnce(new Error('Genkit Error'));
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        
        await expect(DialogueGenerator.generate('Topic', 'Level'))
            .rejects.toThrow('Failed to generate dialogue');
            
        expect(consoleSpy).toHaveBeenCalledWith("Error generating dialogue with Gemini:", expect.any(Error));
    });
});
