/**
 * TypeScript type definitions for Nutrition features
 */

export type GoalType = 'maintain' | 'cut' | 'bulk';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface FoodItem {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving_size: string;
}

export interface NutritionGoal {
  id?: number;
  daily_calories: number;
  daily_protein: number;
  daily_carbs: number;
  daily_fat: number;
  goal_type: GoalType;
  created_at?: string;
  updated_at?: string;
}

export interface MealLog {
  id?: number;
  food_item?: number;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal_type: MealType;
  date: string;
  created_at?: string;
}

export interface DailySummary {
  date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
}
