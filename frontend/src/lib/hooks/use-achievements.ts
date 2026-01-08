import { useState, useEffect, useCallback } from 'react';
import { achievementsAPI } from '@/lib/api-client';
import { parseApiResponse } from './use-async-data';

export interface Achievement {
  id: number;
  name: string;
  description: string;
  category: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  icon: string;
  color: string;
  requirement_type: string;
  requirement_value: number;
  points: number;
  unlocked: boolean;
  unlocked_at?: string;
}

export interface UseAchievementsReturn {
  achievements: Achievement[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  // Computed values
  unlockedCount: number;
  totalPoints: number;
  completionPercentage: number;
  // Filtered lists
  unlockedAchievements: Achievement[];
  lockedAchievements: Achievement[];
}

/**
 * Hook for managing achievements data
 */
export function useAchievements(): UseAchievementsReturn {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAchievements = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await achievementsAPI.getMyAchievements();
      // Response is already an array from my_achievements endpoint
      const data = Array.isArray(response) ? response : [];
      setAchievements(data);
    } catch (err) {
      console.error('Failed to load achievements:', err);
      setError('Failed to load achievements');
      setAchievements([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  // Computed values
  const unlockedAchievements = achievements.filter((a) => a.unlocked);
  const lockedAchievements = achievements.filter((a) => !a.unlocked);
  const unlockedCount = unlockedAchievements.length;
  const totalPoints = unlockedAchievements.reduce((sum, a) => sum + a.points, 0);
  const completionPercentage = achievements.length > 0 
    ? Math.round((unlockedCount / achievements.length) * 100) 
    : 0;

  return {
    achievements,
    isLoading,
    error,
    refetch: fetchAchievements,
    unlockedCount,
    totalPoints,
    completionPercentage,
    unlockedAchievements,
    lockedAchievements,
  };
}

/**
 * Hook for filtering achievements
 */
export function useAchievementFilters(achievements: Achievement[]) {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');

  const filteredAchievements = achievements.filter((a) => {
    const matchesCategory = categoryFilter === 'all' || a.category === categoryFilter;
    const matchesTier = tierFilter === 'all' || a.tier === tierFilter;
    return matchesCategory && matchesTier;
  });

  const categories = [...new Set(achievements.map((a) => a.category))];
  const tiers = ['bronze', 'silver', 'gold', 'platinum'];

  return {
    filteredAchievements,
    categoryFilter,
    setCategoryFilter,
    tierFilter,
    setTierFilter,
    categories,
    tiers,
  };
}
