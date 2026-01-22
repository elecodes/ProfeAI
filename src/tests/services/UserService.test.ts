import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import UserService from '../../services/UserService';
import * as firestore from 'firebase/firestore';

// Mock Firebase
vi.mock('firebase/firestore', () => {
    return {
        doc: vi.fn(),
        setDoc: vi.fn(),
        getDoc: vi.fn(),
        updateDoc: vi.fn(),
        serverTimestamp: vi.fn(() => 'MOCKED_TIMESTAMP'),
        arrayUnion: vi.fn((val) => ['UNION', val]),
        collection: vi.fn(),
        query: vi.fn(),
        where: vi.fn(),
        getDocs: vi.fn(),
        getFirestore: vi.fn(),
        initializeApp: vi.fn(),
    };
});

// Mock the db instance from the local file
vi.mock('../../../firebase/firebase', () => ({
    db: {}
}));

describe('UserService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createUserProfile', () => {
        it('should return early if no user provided', async () => {
            const result = await UserService.createUserProfile(null);
            expect(result).toBeUndefined();
            expect(firestore.doc).not.toHaveBeenCalled();
        });

        it('should create a new profile if one does not exist', async () => {
            const mockUser = { uid: '123', email: 'test@example.com', displayName: 'Test', photoURL: 'http://pic' };
            
            // Mock getDoc to return exists: false
            vi.mocked(firestore.getDoc).mockResolvedValueOnce({
                exists: () => false,
                data: () => undefined
            } as any);

            await UserService.createUserProfile(mockUser);

            expect(firestore.doc).toHaveBeenCalledWith(expect.anything(), 'users', '123');
            expect(firestore.setDoc).toHaveBeenCalledWith(
                undefined, 
                expect.objectContaining({
                    uid: '123',
                    email: 'test@example.com',
                    level: 'beginner',
                    lastActive: 'MOCKED_TIMESTAMP'
                })
            );
        });

        it('should update lastActive if profile exists', async () => {
            const mockUser = { uid: '123' };
            
            // Mock getDoc to return exists: true
            vi.mocked(firestore.getDoc).mockResolvedValueOnce({
                exists: () => true,
                data: () => ({ some: 'data' })
            } as any);

            await UserService.createUserProfile(mockUser);

            expect(firestore.updateDoc).toHaveBeenCalledWith(
                undefined,
                { lastActive: 'MOCKED_TIMESTAMP' }
            );
            expect(firestore.setDoc).not.toHaveBeenCalled();
        });

        it('should handle errors during creation gracefully', async () => {
            const mockUser = { uid: '123' };
            vi.mocked(firestore.getDoc).mockResolvedValueOnce({ exists: () => false } as any);
            vi.mocked(firestore.setDoc).mockRejectedValueOnce(new Error('Firestore Error'));
            
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            
            await UserService.createUserProfile(mockUser);
            
            expect(consoleSpy).toHaveBeenCalledWith("Error creating user profile", expect.any(Error));
        });
    });

    describe('getUserProfile', () => {
        it('should return null if no uid provided', async () => {
            const res = await UserService.getUserProfile('');
            expect(res).toBeNull();
        });

        it('should return user data if found', async () => {
            const mockData = { uid: '123', level: 'advanced' };
            vi.mocked(firestore.getDoc).mockResolvedValueOnce({
                exists: () => true,
                data: () => mockData
            } as any);

            const res = await UserService.getUserProfile('123');
            expect(res).toEqual(mockData);
        });

        it('should return null if not found (or error)', async () => {
            vi.mocked(firestore.getDoc).mockResolvedValueOnce({ exists: () => false } as any);
            const res = await UserService.getUserProfile('123');
            expect(res).toBeNull();
        });

         it('should handle errors gracefully', async () => {
            vi.mocked(firestore.getDoc).mockRejectedValueOnce(new Error('Fetch Error'));
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
            
            const res = await UserService.getUserProfile('123');
            expect(res).toBeNull();
            expect(consoleSpy).toHaveBeenCalledWith("Error fetching user profile", expect.any(Error));
        });
    });

    describe('updateUserProgress', () => {
        it('should return early if no uid', async () => {
            await UserService.updateUserProgress('', {});
            expect(firestore.updateDoc).not.toHaveBeenCalled();
        });

        it('should update doc with new data and timestamp', async () => {
            await UserService.updateUserProgress('123', { level: 'intermediate' });
            expect(firestore.updateDoc).toHaveBeenCalledWith(
                undefined,
                { level: 'intermediate', lastActive: 'MOCKED_TIMESTAMP' }
            );
        });

        it('should handle errors', async () => {
             vi.mocked(firestore.updateDoc).mockRejectedValueOnce(new Error('Update Error'));
             const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
             
             await UserService.updateUserProgress('123', {});
             expect(consoleSpy).toHaveBeenCalled();
        });
    });

    describe('addLearnedPhrase', () => {
        it('should return early if no uid', async () => {
             await UserService.addLearnedPhrase('', {} as any);
             expect(firestore.updateDoc).not.toHaveBeenCalled();
        });

        it('should add phrase to array', async () => {
            const phrase = { id: 'p1', text: 'Hola', translation: 'Hello' };
            await UserService.addLearnedPhrase('123', phrase as any);
            
            expect(firestore.arrayUnion).toHaveBeenCalledWith(phrase);
            expect(firestore.updateDoc).toHaveBeenCalledWith(
                undefined,
                expect.objectContaining({
                    learnedPhrases: ['UNION', phrase]
                })
            );
        });

        it('should handle errors', async () => {
             vi.mocked(firestore.updateDoc).mockRejectedValueOnce(new Error('Update Error'));
             const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
             
             await UserService.addLearnedPhrase('123', {} as any);
             expect(consoleSpy).toHaveBeenCalled();
        });
    });

    describe('recordSession', () => {
         it('should return early if no uid', async () => {
             await UserService.recordSession('', {} as any);
             expect(firestore.updateDoc).not.toHaveBeenCalled();
        });

        it('should add session to history', async () => {
            const session = { type: 'quiz', score: 10 };
            await UserService.recordSession('123', session as any);
            
            expect(firestore.arrayUnion).toHaveBeenCalledWith(expect.objectContaining({ type: 'quiz', score: 10 }));
        });

         it('should handle errors', async () => {
             vi.mocked(firestore.updateDoc).mockRejectedValueOnce(new Error('Record Error'));
             const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
             
             await UserService.recordSession('123', {} as any);
             expect(consoleSpy).toHaveBeenCalled();
        });
    });

    describe('getUnlockedWeeks', () => {
        it('should return 1 if no user or no createdAt', () => {
            expect(UserService.getUnlockedWeeks({} as any)).toBe(1);
        });

        it('should calculate weeks based on date difference', () => {
            // Mock Date
            const now = new Date('2024-01-15T00:00:00Z');
            vi.useFakeTimers();
            vi.setSystemTime(now);

            // Created 1 day ago -> Week 1
            const userNew = { createdAt: new Date('2024-01-14T00:00:00Z').toISOString() } as any;
            expect(UserService.getUnlockedWeeks(userNew)).toBe(1);

            // Created 8 days ago -> Week 2 (1 + floor(8/7) = 1 + 1 = 2)
            const userWeek2 = { createdAt: new Date('2024-01-07T00:00:00Z').toISOString() } as any;
            expect(UserService.getUnlockedWeeks(userWeek2)).toBe(2);

             // Created 15 days ago -> Week 3
            const userWeek3 = { createdAt: new Date('2023-12-31T00:00:00Z').toISOString() } as any;
            expect(UserService.getUnlockedWeeks(userWeek3)).toBe(3);

            vi.useRealTimers();
        });

        it('should handle Firestore Timestamp objects with toDate()', () => {
             const now = new Date('2024-01-15T00:00:00Z');
             vi.useFakeTimers();
             vi.setSystemTime(now);

             const mockTimestamp = {
                 toDate: () => new Date('2024-01-01T00:00:00Z') // 14 days ago -> Week 3
             };
             
             expect(UserService.getUnlockedWeeks({ createdAt: mockTimestamp } as any)).toBe(3);
             
             vi.useRealTimers();
        });
    });
});
