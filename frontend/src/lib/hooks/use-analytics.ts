import { useState, useEffect, useCallback } from 'react';
import { analyticsAPI } from '@/lib/api-client';

export type AnalyticsPeriod = '7d' | '30d' | '90d' | 'all';

export interface AnalyticsSummary {
  metrics: {
    total_workouts: number;
    total_duration: number;
    total_points: number;
    avg_duration: number;
    avg_intensity_score: number;
    completion_rate: number;
  };
  intensity_breakdown: {
    light: number;
    moderate: number;
    intense: number;
  };
  goal_breakdown: Record<string, number>;
  equipment_breakdown: Record<string, number>;
}

export interface TrendDataPoint {
  date: string;
  workouts: number;
  duration: number;
  points: number;
  avg_intensity: number;
}

export interface AnalyticsTrends {
  granularity: string;
  data: TrendDataPoint[];
}

export interface MuscleFrequency {
  muscle: string;
  count: number;
  total_duration: number;
  percentage: number;
}

export interface AnalyticsMuscles {
  muscle_frequency: MuscleFrequency[];
  muscle_pairs: any[];
}

export interface ConsistencyData {
  current_streak: number;
  longest_streak: number;
  workout_calendar: Array<{
    date: string;
    has_workout: boolean;
    workout_count: number;
    total_points: number;
  }>;
  weekly_consistency: {
    target_workouts_per_week: number;
    actual_avg_per_week: number;
    achievement_rate: number;
    weeks_on_target: number;
    total_weeks: number;
  };
  day_of_week_breakdown: Record<string, number>;
}

export interface PersonalRecords {
  records: {
    longest_workout?: { duration: number; date: string; workout_id: number };
    highest_points?: { points: number; date: string; workout_id: number };
    most_exercises?: { count: number; date: string; workout_id: number };
  };
  recent_milestones: Array<{
    type: string;
    value: number;
    achieved_date: string;
  }>;
}

export interface UseAnalyticsReturn {
  period: AnalyticsPeriod;
  setPeriod: (period: AnalyticsPeriod) => void;
  summary: AnalyticsSummary | null;
  trends: AnalyticsTrends | null;
  muscles: AnalyticsMuscles | null;
  consistency: ConsistencyData | null;
  records: PersonalRecords | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for managing analytics data with period selection
 */
export function useAnalytics(): UseAnalyticsReturn {
  const [period, setPeriod] = useState<AnalyticsPeriod>('30d');
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [trends, setTrends] = useState<AnalyticsTrends | null>(null);
  const [muscles, setMuscles] = useState<AnalyticsMuscles | null>(null);
  const [consistency, setConsistency] = useState<ConsistencyData | null>(null);
  const [records, setRecords] = useState<PersonalRecords | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch all analytics data in parallel
      const [summaryData, trendsData, musclesData, consistencyData, recordsData] = 
        await Promise.all([
          analyticsAPI.getSummary({ period }),
          analyticsAPI.getTrends({ period, granularity: 'daily' }),
          analyticsAPI.getMuscles({ period, top_n: 10 }),
          analyticsAPI.getConsistency({ period }),
          analyticsAPI.getRecords(),
        ]);

      setSummary(summaryData);
      setTrends(trendsData);
      setMuscles(musclesData);
      setConsistency(consistencyData);
      setRecords(recordsData);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    period,
    setPeriod,
    summary,
    trends,
    muscles,
    consistency,
    records,
    isLoading,
    error,
    refetch: fetchAnalytics,
  };
}

/**
 * Hook for fetching only summary analytics (lighter weight)
 */
export function useAnalyticsSummary(period: AnalyticsPeriod = '30d') {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await analyticsAPI.getSummary({ period });
      setSummary(data);
    } catch (err) {
      console.error('Failed to load analytics summary:', err);
      setError('Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { summary, isLoading, error, refetch: fetchSummary };
}
