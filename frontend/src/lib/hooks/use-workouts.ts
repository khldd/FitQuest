import { useState, useEffect, useCallback } from 'react';
import { workoutAPI } from '@/lib/api-client';
import { parseApiResponse } from './use-async-data';

export interface WorkoutHistoryItem {
  id: number;
  workout_date: string;
  muscles_targeted: string[];
  duration: number;
  intensity: string;
  goal: string;
  equipment: string;
  exercises_completed: any[];
  status: 'planned' | 'in_progress' | 'completed';
  points_earned: number;
}

export interface GeneratedWorkout {
  exercises: any[];
  estimated_duration: number;
  intensity: string;
  goal: string;
  equipment: string;
  muscles_targeted: string[];
  total_exercises: number;
}

export interface UseWorkoutsReturn {
  workouts: WorkoutHistoryItem[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  completeWorkout: (id: number) => Promise<{ success: boolean; achievements?: any[] }>;
  generateWorkout: (params: GenerateWorkoutParams) => Promise<GeneratedWorkout | null>;
  createHistory: (data: CreateHistoryParams) => Promise<WorkoutHistoryItem | null>;
}

export interface GenerateWorkoutParams {
  muscles_targeted: string[];
  duration: number;
  intensity: 'light' | 'moderate' | 'intense';
  goal: 'strength' | 'hypertrophy' | 'endurance';
  equipment: 'bodyweight' | 'home' | 'gym';
}

export interface CreateHistoryParams {
  muscles_targeted: string[];
  duration: number;
  intensity: string;
  goal: string;
  equipment: string;
  exercises_completed: any[];
  status?: 'planned' | 'in_progress' | 'completed';
}

/**
 * Hook for managing workout data - history, generation, and completion
 */
export function useWorkouts(): UseWorkoutsReturn {
  const [workouts, setWorkouts] = useState<WorkoutHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkouts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await workoutAPI.getHistory({ ordering: '-workout_date' });
      const data = parseApiResponse<WorkoutHistoryItem>(response);
      setWorkouts(data);
    } catch (err) {
      console.error('Failed to load workouts:', err);
      setError('Failed to load workout history');
      setWorkouts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const completeWorkout = useCallback(async (id: number) => {
    try {
      const response = await workoutAPI.updateHistory(id, { status: 'completed' });
      
      // Refresh the workout list
      await fetchWorkouts();
      
      return {
        success: true,
        achievements: response.newly_unlocked_achievements || [],
      };
    } catch (err) {
      console.error('Failed to complete workout:', err);
      return { success: false };
    }
  }, [fetchWorkouts]);

  const generateWorkout = useCallback(async (params: GenerateWorkoutParams) => {
    try {
      const response = await workoutAPI.generateWorkout(params);
      return response as GeneratedWorkout;
    } catch (err) {
      console.error('Failed to generate workout:', err);
      return null;
    }
  }, []);

  const createHistory = useCallback(async (data: CreateHistoryParams) => {
    try {
      const response = await workoutAPI.createHistory(data);
      // Refresh workouts after creating
      await fetchWorkouts();
      return response as WorkoutHistoryItem;
    } catch (err) {
      console.error('Failed to create workout history:', err);
      return null;
    }
  }, [fetchWorkouts]);

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  return {
    workouts,
    isLoading,
    error,
    refetch: fetchWorkouts,
    completeWorkout,
    generateWorkout,
    createHistory,
  };
}

/**
 * Computed helpers for workout data
 */
export function useWorkoutStats(workouts: WorkoutHistoryItem[]) {
  const totalWorkouts = workouts.length;
  const completedCount = workouts.filter((w) => w.status === 'completed').length;
  const pendingCount = totalWorkouts - completedCount;
  const totalPoints = workouts.reduce((sum, w) => sum + (w.points_earned || 0), 0);

  return {
    totalWorkouts,
    completedCount,
    pendingCount,
    totalPoints,
  };
}
