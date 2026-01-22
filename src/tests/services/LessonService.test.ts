import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LessonService } from '../../services/LessonService';
import * as firestore from 'firebase/firestore';

// Mock Firebase
vi.mock('firebase/firestore', () => {
    return {
        doc: vi.fn(),
        setDoc: vi.fn(),
        getDoc: vi.fn(),
        getDocs: vi.fn(),
        collection: vi.fn(),
        query: vi.fn(),
        where: vi.fn(),
        getFirestore: vi.fn(),
    };
});

// Mock the db instance
vi.mock('../../../firebase/firebase', () => ({
    db: {}
}));

describe('LessonService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getLessons', () => {
        it('should fetch lessons for a given level', async () => {
             const mockDocs = [
                 { id: '1', data: () => ({ title: 'Lesson 1', level: 'beginner' }) },
                 { id: '2', data: () => ({ title: 'Lesson 2', level: 'beginner' }) }
             ];
             
             vi.mocked(firestore.getDocs).mockResolvedValueOnce({
                 forEach: (callback: any) => mockDocs.forEach(callback)
             } as any);

             const lessons = await LessonService.getLessons('beginner');
             
             expect(firestore.collection).toHaveBeenCalledWith(expect.anything(), 'lessons');
             expect(firestore.where).toHaveBeenCalledWith('level', '==', 'beginner');
             expect(lessons).toHaveLength(2);
             expect(lessons[0]).toEqual({ id: '1', title: 'Lesson 1', level: 'beginner' });
        });

        it('should handle errors', async () => {
            vi.mocked(firestore.getDocs).mockRejectedValueOnce(new Error('Query Error'));
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            await expect(LessonService.getLessons('beginner')).rejects.toThrow('Query Error');
            expect(consoleSpy).toHaveBeenCalledWith("Error fetching lessons from Firestore:", expect.any(Error));
        });
    });

    describe('setLesson', () => {
        it('should write lesson data', async () => {
             await LessonService.setLesson('lesson_id', { title: 'New Lesson' } as any);
             
             expect(firestore.doc).toHaveBeenCalledWith(expect.anything(), 'lessons', 'lesson_id');
             expect(firestore.setDoc).toHaveBeenCalledWith(undefined, { title: 'New Lesson' });
        });

         it('should handle write errors', async () => {
             vi.mocked(firestore.setDoc).mockRejectedValueOnce(new Error('Write Error'));
             const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
             
             await expect(LessonService.setLesson('id', {} as any)).rejects.toThrow('Write Error');
             expect(consoleSpy).toHaveBeenCalledWith("Error writing lesson:", expect.any(Error));
        });
    });
});
