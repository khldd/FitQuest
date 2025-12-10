export type MuscleView = 'front' | 'back';

export type MuscleGroup = 
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'arms'
  | 'abs'
  | 'legs'
  | 'cardio';

export interface Muscle {
  id: string;
  name: string;
  group: MuscleGroup;
  view: MuscleView;
  // SVG path definition
  path: string; 
  // Position for label or highlight center
  cx: number;
  cy: number;
}

export interface BodyState {
  gender: 'male' | 'female';
  view: MuscleView;
  selectedMuscles: string[]; // IDs
}
