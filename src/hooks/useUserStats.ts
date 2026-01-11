import { useState, useEffect } from 'react';

interface UserStats {
  username: string;
  xp: number;
  level: string;
  streak: number;
  lastLoginDate: string | null;
}

const LEVEL_THRESHOLDS = {
  beginner: 0,
  intermediate: 100,
  advanced: 500,
};

export const useUserStats = () => {
  const [stats, setStats] = useState<UserStats>(() => {
    const savedStats = localStorage.getItem('userStats');
    return savedStats ? JSON.parse(savedStats) : {
      username: 'Estudiante',
      xp: 0,
      level: 'Principiante',
      streak: 0,
      lastLoginDate: null,
    };
  });

  // Removed the useEffect that loads on mount to avoid race conditions or overwrites
  // useEffect(() => {
  //   const savedStats = localStorage.getItem('userStats');
  //   if (savedStats) {
  //     setStats(JSON.parse(savedStats));
  //   }
  // }, []);

  useEffect(() => {
    localStorage.setItem('userStats', JSON.stringify(stats));
  }, [stats]);

  const calculateLevel = (xp: number) => {
    if (xp >= LEVEL_THRESHOLDS.advanced) return 'Avanzado';
    if (xp >= LEVEL_THRESHOLDS.intermediate) return 'Intermedio';
    return 'Principiante';
  };

  const addXP = (amount: number) => {
    setStats((prev) => {
      const newXP = prev.xp + amount;
      return {
        ...prev,
        xp: newXP,
        level: calculateLevel(newXP),
      };
    });
  };

  const updateProfile = (username: string) => {
    setStats((prev) => ({
      ...prev,
      username
    }));
  };

  const resetStats = () => {
    const defaultStats: UserStats = {
      username: 'Estudiante',
      xp: 0,
      level: 'Principiante',
      streak: 0,
      lastLoginDate: null,
    };
    setStats(defaultStats);
    localStorage.removeItem('userStats');
  };

  const incrementStreak = () => {
      const today = new Date().toISOString().split('T')[0];
      setStats(prev => {
          if (prev.lastLoginDate === today) return prev;
          
          // Logic for checking consecutive days could be added here
          // For now, just increment if it's a new day
          return {
              ...prev,
              streak: prev.streak + 1,
              lastLoginDate: today
          }
      })
  }

  // Initialize streak on load if needed
  useEffect(() => {
     incrementStreak();
  }, []);

  return { stats, addXP, updateProfile, resetStats };
};
