import { describe, it, expect } from 'vitest';
import GrammarService from '../../services/GrammarService';

describe('GrammarService', () => {
    describe('analyze', () => {
        it('should return 0 score and feedback for empty text', async () => {
            const result = await GrammarService.analyze('', 'context');
            expect(result.score).toBe(0);
            expect(result.generalFeedback).toContain('No hay suficiente texto');
        });

        it('should detect infinitive errors (Yo querer)', async () => {
            const result = await GrammarService.analyze('Yo querer comer pizza');
            expect(result.corrections).toContainEqual(expect.objectContaining({
                original: 'Yo querer',
                type: 'grammar'
            }));
            expect(result.score).toBeLessThan(100);
        });

        it('should detect Gustar errors (Yo gusta)', async () => {
             const result = await GrammarService.analyze('Yo gusta el cine');
             expect(result.corrections).toContainEqual(expect.objectContaining({
                 original: 'Yo gusta',
                 corrected: 'Me gusta',
             }));
             expect(result.score).toBeLessThan(100);
        });

        it('should detect Ser/Estar errors (Soy bien)', async () => {
             const result = await GrammarService.analyze('Soy bien gracias');
             expect(result.corrections).toContainEqual(expect.objectContaining({
                 original: 'soy bien',
                 corrected: 'estoy bien'
             }));
        });

        it('should detect Gender Agreement errors (El casa)', async () => {
             const result = await GrammarService.analyze('El casa es grande');
             expect(result.corrections).toContainEqual(expect.objectContaining({
                 original: 'el casa',
                 corrected: 'la casa'
             }));
        });
        
         it('should detect Gender Agreement errors (La problema)', async () => {
             const result = await GrammarService.analyze('Tengo la problema');
             expect(result.corrections).toContainEqual(expect.objectContaining({
                 original: 'la problema',
                 corrected: 'el problema'
             }));
        });

        it('should detect Tense Mismatch (Ayer + Present)', async () => {
             const result = await GrammarService.analyze('Ayer voy al cine');
             expect(result.corrections).toContainEqual(expect.objectContaining({
                 original: 'Ayer... (presente)',
             }));
             expect(result.score).toBeLessThan(100);
        });

        it('should return perfect score for correct text', async () => {
             const result = await GrammarService.analyze('Yo quiero comer pizza. Me gusta el cine. Estoy bien.');
             expect(result.score).toBe(100);
             expect(result.corrections).toHaveLength(0);
             expect(result.generalFeedback).toContain('Excelente');
        });
        
        it('should give feedback based on score ranges', async () => {
            // Score < 50
            const bad = await GrammarService.analyze('Yo querer. Yo gusta. Soy bien. El casa. Ayer voy.'); 
            expect(bad.generalFeedback).toContain('Sigue practicando');
            
            // Score >= 50 && < 80
            const mid = await GrammarService.analyze('Yo querer comer.'); // -15
            // 100 - 15 = 85 (Wait, logic is subtraction)
            // Let's force it down. -15 -15 -10 = 60
             const midResult = await GrammarService.analyze('Yo querer. Yo gusta. Soy bien.');
             expect(midResult.score).toBe(60);
             expect(midResult.generalFeedback).toContain('Buen intento');
        });
    });
});
