/**
 * TypeScript type definitions for Workout Programs
 */

export type ProgramDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type ProgramGoal = 'strength' | 'muscle' | 'fat_loss' | 'general_fitness' | 'endurance';
export type EnrollmentStatus = 'active' | 'paused' | 'completed' | 'abandoned';
export type DayIntensity = 'light' | 'moderate' | 'intense';

export interface ProgramDay {
  id: number;
  week_number: number;
  day_number: number;
  name: string;
  description: string;
  muscles_targeted: string[];
  duration_minutes: number;
  duration?: number; // Backend field name
  intensity: DayIntensity;
  is_rest_day: boolean;
}

export interface WorkoutProgram {
  id: number;
  name: string;
  description: string;
  difficulty: ProgramDifficulty;
  goal: ProgramGoal;
  duration_weeks: number;
  days_per_week: number;
  icon: string;
  color: string;
  equipment_needed: string;
  is_featured: boolean;
  enrolled_count: number;
  created_at: string;
}

export interface WorkoutProgramDetail extends WorkoutProgram {
  days: ProgramDay[];
  schedule: ProgramWeekSchedule[];
  user_enrollment?: UserEnrollmentBasic | null;
}

export interface ProgramWeekSchedule {
  week: number;
  days: ProgramDay[];
}

export interface UserEnrollmentBasic {
  id: number;
  status: EnrollmentStatus;
  current_week: number;
  current_day: number;
  started_at: string;
  completion_percentage: number;
}

export interface UserProgramEnrollment {
  id: number;
  program: WorkoutProgram;
  status: EnrollmentStatus;
  current_week: number;
  current_day: number;
  started_at: string;
  completed_at: string | null;
  paused_at: string | null;
  completion_percentage: number;
  completed_days_count: number;
  total_days_count: number;
}

export interface UserProgramEnrollmentDetail extends UserProgramEnrollment {
  program: WorkoutProgramDetail;
  completed_days: ProgramDayCompletion[];
  next_day: ProgramDay | null;
  days_until_completion: number;
}

export interface ProgramDayCompletion {
  id: number;
  program_day: number | ProgramDay;  // Backend returns ID, but could be object in some contexts
  program_day_name?: string;
  week_number?: number;
  day_number?: number;
  workout_history_id: number | null;
  completed_at: string;
  notes: string;
}

export interface EnrollProgramParams {
  program_id: number;
}

export interface CompleteDayParams {
  program_day_id: number;
  workout_history_id?: number;
  notes?: string;
}

export interface ProgramListParams {
  difficulty?: ProgramDifficulty;
  goal?: ProgramGoal;
  is_featured?: boolean;
  search?: string;
  ordering?: string;
}
