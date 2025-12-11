import { create } from 'zustand';

export interface Exercise {
    id: string;
    name: string;
    sets: number;
    reps: string;
    rest: number; // seconds
    instructions?: string[];
    muscleGroup?: string;
    image_url?: string;
    gif_url?: string;
    video_url?: string;
}

export interface WorkoutPlan {
    exercises: any[];
    muscles_targeted: string[];
    duration: number;
    intensity: string;
    goal: string;
    equipment: string;
}

export interface WorkoutSessionState {
    workout: WorkoutPlan | null;
    setWorkout: (workout: WorkoutPlan) => void;
    clearWorkout: () => void;
}

export const useWorkoutSessionStore = create<WorkoutSessionState>((set) => ({
    workout: null,
    setWorkout: (workout) => set({ workout }),
    clearWorkout: () => set({ workout: null }),
}));
