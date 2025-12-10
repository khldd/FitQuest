import { create } from 'zustand';

export interface Exercise {
    id: string;
    name: string;
    sets: number;
    reps: string;
    rest: number; // seconds
    instructions?: string[];
    muscleGroup?: string;
}

export interface WorkoutSessionState {
    workout: Exercise[];
    setWorkout: (exercises: Exercise[]) => void;
    clearWorkout: () => void;
}

export const useWorkoutSessionStore = create<WorkoutSessionState>((set) => ({
    workout: [],
    setWorkout: (exercises) => set({ workout: exercises }),
    clearWorkout: () => set({ workout: [] }),
}));
