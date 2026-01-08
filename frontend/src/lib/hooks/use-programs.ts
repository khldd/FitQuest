import { useState, useEffect, useCallback } from 'react';
import { programsAPI } from '@/lib/api-client';
import { parseApiResponse } from './use-async-data';
import type {
  WorkoutProgram,
  WorkoutProgramDetail,
  UserProgramEnrollment,
  UserProgramEnrollmentDetail,
  ProgramListParams,
  ProgramDifficulty,
  ProgramGoal,
  ProgramDay,
} from '@/types/program';

/**
 * Transform backend program data to frontend format
 */
function transformProgram(program: any): WorkoutProgram {
  return {
    ...program,
    duration_weeks: program.weeks || program.duration_weeks,
    enrolled_count: program.enrollment_count || program.enrolled_count || 0,
  };
}

/**
 * Hook for fetching list of workout programs
 */
export function usePrograms(params?: ProgramListParams) {
  const [programs, setPrograms] = useState<WorkoutProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrograms = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await programsAPI.getAll(params);
      const data = parseApiResponse<any>(response);
      setPrograms(data.map(transformProgram));
    } catch (err) {
      console.error('Failed to load programs:', err);
      setError('Failed to load workout programs');
      setPrograms([]);
    } finally {
      setIsLoading(false);
    }
  }, [params?.difficulty, params?.goal, params?.is_featured, params?.search, params?.ordering]);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  return {
    programs,
    isLoading,
    error,
    refetch: fetchPrograms,
  };
}

/**
 * Hook for fetching featured programs
 */
export function useFeaturedPrograms() {
  const [programs, setPrograms] = useState<WorkoutProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeatured = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await programsAPI.getFeatured();
      const data = Array.isArray(response) ? response : [];
      setPrograms(data.map(transformProgram));
    } catch (err) {
      console.error('Failed to load featured programs:', err);
      setError('Failed to load featured programs');
      setPrograms([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeatured();
  }, [fetchFeatured]);

  return {
    programs,
    isLoading,
    error,
    refetch: fetchFeatured,
  };
}

/**
 * Hook for fetching a single program's details
 */
export function useProgramDetail(programId: number | null) {
  const [program, setProgram] = useState<WorkoutProgramDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProgram = useCallback(async () => {
    if (!programId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await programsAPI.getById(programId);
      
      // Transform program_days into schedule format grouped by week
      const programDays = response.program_days || [];
      const scheduleMap: Record<number, ProgramDay[]> = {};
      
      for (const day of programDays) {
        const weekNum = day.week_number;
        if (!scheduleMap[weekNum]) {
          scheduleMap[weekNum] = [];
        }
        // Map backend field names to frontend expected names
        scheduleMap[weekNum].push({
          ...day,
          duration_minutes: day.duration || day.duration_minutes,
          muscles_targeted: day.muscles_targeted || [],
        });
      }
      
      // Convert to array format sorted by week
      const schedule = Object.entries(scheduleMap)
        .map(([week, days]) => ({
          week: parseInt(week, 10),
          days: days.sort((a, b) => a.day_number - b.day_number),
        }))
        .sort((a, b) => a.week - b.week);
      
      // Map backend field names to frontend expected names
      const transformedProgram = {
        ...response,
        duration_weeks: response.weeks || response.duration_weeks,
        enrolled_count: response.enrollment_count || response.enrolled_count || 0,
        schedule,
      };
      
      setProgram(transformedProgram);
    } catch (err) {
      console.error('Failed to load program details:', err);
      setError('Failed to load program details');
      setProgram(null);
    } finally {
      setIsLoading(false);
    }
  }, [programId]);

  useEffect(() => {
    fetchProgram();
  }, [fetchProgram]);

  return {
    program,
    isLoading,
    error,
    refetch: fetchProgram,
  };
}

/**
 * Hook for managing user's active enrollment
 */
export function useActiveEnrollment() {
  const [enrollment, setEnrollment] = useState<UserProgramEnrollmentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveEnrollment = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await programsAPI.getActiveEnrollment();
      setEnrollment(response);
    } catch (err: any) {
      // 404 means no active enrollment, which is fine
      if (err.response?.status === 404) {
        setEnrollment(null);
      } else {
        console.error('Failed to load active enrollment:', err);
        setError('Failed to load active enrollment');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveEnrollment();
  }, [fetchActiveEnrollment]);

  return {
    enrollment,
    isLoading,
    error,
    hasActiveEnrollment: !!enrollment,
    refetch: fetchActiveEnrollment,
  };
}

/**
 * Hook for managing enrollments (all actions)
 */
export function useEnrollments() {
  const [enrollments, setEnrollments] = useState<UserProgramEnrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchEnrollments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await programsAPI.getEnrollments({ ordering: '-started_at' });
      const data = parseApiResponse<UserProgramEnrollment>(response);
      setEnrollments(data);
    } catch (err) {
      console.error('Failed to load enrollments:', err);
      setError('Failed to load enrollments');
      setEnrollments([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const enroll = useCallback(async (programId: number) => {
    setIsActionLoading(true);
    try {
      const response = await programsAPI.enroll(programId);
      await fetchEnrollments();
      return { success: true, enrollment: response };
    } catch (err: any) {
      console.error('Failed to enroll:', err);
      const message = err.response?.data?.error || 'Failed to enroll in program';
      return { success: false, error: message };
    } finally {
      setIsActionLoading(false);
    }
  }, [fetchEnrollments]);

  const completeDay = useCallback(async (
    enrollmentId: number,
    programDayId: number,
    workoutHistoryId?: number,
    notes?: string
  ) => {
    setIsActionLoading(true);
    try {
      const response = await programsAPI.completeDay(enrollmentId, {
        program_day_id: programDayId,
        workout_history_id: workoutHistoryId,
        notes,
      });
      await fetchEnrollments();
      return { success: true, data: response };
    } catch (err: any) {
      console.error('Failed to complete day:', err);
      const message = err.response?.data?.error || 'Failed to mark day as complete';
      return { success: false, error: message };
    } finally {
      setIsActionLoading(false);
    }
  }, [fetchEnrollments]);

  const pause = useCallback(async (enrollmentId: number) => {
    setIsActionLoading(true);
    try {
      await programsAPI.pauseEnrollment(enrollmentId);
      await fetchEnrollments();
      return { success: true };
    } catch (err: any) {
      console.error('Failed to pause enrollment:', err);
      const message = err.response?.data?.error || 'Failed to pause program';
      return { success: false, error: message };
    } finally {
      setIsActionLoading(false);
    }
  }, [fetchEnrollments]);

  const resume = useCallback(async (enrollmentId: number) => {
    setIsActionLoading(true);
    try {
      await programsAPI.resumeEnrollment(enrollmentId);
      await fetchEnrollments();
      return { success: true };
    } catch (err: any) {
      console.error('Failed to resume enrollment:', err);
      const message = err.response?.data?.error || 'Failed to resume program';
      return { success: false, error: message };
    } finally {
      setIsActionLoading(false);
    }
  }, [fetchEnrollments]);

  const abandon = useCallback(async (enrollmentId: number) => {
    setIsActionLoading(true);
    try {
      await programsAPI.abandonEnrollment(enrollmentId);
      await fetchEnrollments();
      return { success: true };
    } catch (err: any) {
      console.error('Failed to abandon enrollment:', err);
      const message = err.response?.data?.error || 'Failed to abandon program';
      return { success: false, error: message };
    } finally {
      setIsActionLoading(false);
    }
  }, [fetchEnrollments]);

  useEffect(() => {
    fetchEnrollments();
  }, [fetchEnrollments]);

  return {
    enrollments,
    isLoading,
    error,
    isActionLoading,
    refetch: fetchEnrollments,
    enroll,
    completeDay,
    pause,
    resume,
    abandon,
  };
}

/**
 * Program filter options for UI
 */
export const DIFFICULTY_OPTIONS: { value: ProgramDifficulty; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

export const GOAL_OPTIONS: { value: ProgramGoal; label: string }[] = [
  { value: 'strength', label: 'Strength' },
  { value: 'muscle', label: 'Build Muscle' },
  { value: 'fat_loss', label: 'Fat Loss' },
  { value: 'endurance', label: 'Endurance' },
  { value: 'general_fitness', label: 'General Fitness' },
];

/**
 * Helper to get difficulty color
 */
export function getDifficultyColor(difficulty: ProgramDifficulty): string {
  switch (difficulty) {
    case 'beginner':
      return 'text-green-500 bg-green-500/10';
    case 'intermediate':
      return 'text-yellow-500 bg-yellow-500/10';
    case 'advanced':
      return 'text-red-500 bg-red-500/10';
    default:
      return 'text-gray-500 bg-gray-500/10';
  }
}

/**
 * Helper to get goal icon
 */
export function getGoalIcon(goal: ProgramGoal): string {
  switch (goal) {
    case 'strength':
      return '💪';
    case 'muscle':
      return '🏋️';
    case 'fat_loss':
      return '🔥';
    case 'endurance':
      return '🏃';
    case 'general_fitness':
      return '⭐';
    default:
      return '🎯';
  }
}

/**
 * Helper to format program duration
 */
export function formatProgramDuration(weeks: number, daysPerWeek: number): string {
  return `${weeks} weeks • ${daysPerWeek} days/week`;
}
