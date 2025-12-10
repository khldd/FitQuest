import { create } from 'zustand';

export type Intensity = 'light' | 'medium' | 'hard';
export type Goal = 'hypertrophy' | 'strength' | 'fat_loss' | 'endurance';
export type Setting = 'gym' | 'home' | 'bodyweight';

interface WorkoutConfigState {
    intensity: Intensity | null;
    goal: Goal | null;
    duration: number; // in minutes
    setting: Setting | null;

    // Actions
    setIntensity: (intensity: Intensity) => void;
    setGoal: (goal: Goal) => void;
    setDuration: (duration: number) => void;
    setSetting: (setting: Setting) => void;
    resetConfig: () => void;
}

export const useWorkoutConfigStore = create<WorkoutConfigState>((set) => ({
    intensity: null,
    goal: null,
    duration: 45, // default
    setting: 'gym',

    setIntensity: (intensity) => set({ intensity }),
    setGoal: (goal) => set({ goal }),
    setDuration: (duration) => set({ duration }),
    setSetting: (setting) => set({ setting }),
    resetConfig: () => set({ intensity: null, goal: null, duration: 45, setting: 'gym' }),
}));
