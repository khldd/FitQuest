/**
 * TypeScript type definitions for Analytics features
 */

// Query parameters
export interface AnalyticsParams {
  period?: '7d' | '30d' | '90d' | 'all';
  start_date?: string;
  end_date?: string;
}

export interface TrendsParams extends AnalyticsParams {
  granularity?: 'daily' | 'weekly' | 'monthly';
}

// Period info
export interface PeriodInfo {
  start: string | null;
  end: string;
  label: string;
}

// Summary metrics
export interface SummaryMetrics {
  total_workouts: number;
  total_duration: number;
  total_points: number;
  avg_duration: number;
  avg_intensity_score: number;
  completion_rate: number;
}

export interface IntensityBreakdown {
  light: number;
  moderate: number;
  intense: number;
}

export interface GoalBreakdown {
  [key: string]: number | undefined;
  strength?: number;
  hypertrophy?: number;
  endurance?: number;
  fat_loss?: number;
}

export interface EquipmentBreakdown {
  [key: string]: number | undefined;
  gym?: number;
  home?: number;
  bodyweight?: number;
}

// Analytics summary response
export interface AnalyticsSummary {
  period: PeriodInfo;
  metrics: SummaryMetrics;
  intensity_breakdown: IntensityBreakdown;
  goal_breakdown: GoalBreakdown;
  equipment_breakdown: EquipmentBreakdown;
}

// Trends data
export interface TrendsDataPoint {
  date: string;
  workouts: number;
  duration: number;
  points: number;
  avg_intensity: number;
}

export interface TrendsData {
  granularity: 'daily' | 'weekly' | 'monthly';
  data: TrendsDataPoint[];
}

// Muscle analytics
export interface MuscleFrequency {
  muscle: string;
  count: number;
  total_duration: number;
  percentage: number;
}

export interface MuscleAnalytics {
  muscle_frequency: MuscleFrequency[];
  muscle_pairs: string[][];
}

// Consistency data
export interface WorkoutCalendarDay {
  date: string;
  has_workout: boolean;
  workout_count: number;
  total_points: number;
}

export interface WeeklyConsistency {
  target_workouts_per_week: number;
  actual_avg_per_week: number;
  achievement_rate: number;
  weeks_on_target: number;
  total_weeks: number;
}

export interface DayOfWeekBreakdown {
  Monday: number;
  Tuesday: number;
  Wednesday: number;
  Thursday: number;
  Friday: number;
  Saturday: number;
  Sunday: number;
}

export interface ConsistencyData {
  current_streak: number;
  longest_streak: number;
  workout_calendar: WorkoutCalendarDay[];
  weekly_consistency: WeeklyConsistency;
  day_of_week_breakdown: DayOfWeekBreakdown;
}

// Personal records
export interface PersonalRecord {
  duration?: number;
  points?: number;
  count?: number;
  date: string;
  workout_id: number;
}

export interface PersonalRecords {
  records: {
    longest_workout?: PersonalRecord;
    highest_points?: PersonalRecord;
    most_exercises?: PersonalRecord;
  };
  recent_milestones: Milestone[];
}

export interface Milestone {
  type: 'total_workouts' | 'total_points';
  value: number;
  achieved_date: string;
}

// Chart data types
export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: any;
}
