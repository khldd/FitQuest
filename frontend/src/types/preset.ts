/**
 * TypeScript type definitions for Workout Presets
 */

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface WorkoutPreset {
  id: number;
  name: string;
  description: string;
  muscle_groups: string[];
  recommended_level: DifficultyLevel;
  created_at: string;
}

export interface PresetParams {
  search?: string;
  ordering?: 'name' | '-name' | 'recommended_level' | '-recommended_level';
}
