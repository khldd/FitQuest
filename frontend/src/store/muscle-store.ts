import { create } from 'zustand';
import { MuscleView } from '@/types/muscle';

interface MuscleState {
    selectedMuscles: string[]; // IDs of selected muscles
    view: MuscleView;
    gender: 'male' | 'female';

    // Actions
    toggleMuscle: (id: string) => void;
    clearSelection: () => void;
    setView: (view: MuscleView) => void;
    setGender: (gender: 'male' | 'female') => void;
}

export const useMuscleStore = create<MuscleState>((set) => ({
    selectedMuscles: [],
    view: 'front',
    gender: 'male', // Default

    toggleMuscle: (id) =>
        set((state) => {
            const isSelected = state.selectedMuscles.includes(id);
            return {
                selectedMuscles: isSelected
                    ? state.selectedMuscles.filter((m) => m !== id)
                    : [...state.selectedMuscles, id],
            };
        }),

    clearSelection: () => set({ selectedMuscles: [] }),
    setView: (view) => set({ view }),
    setGender: (gender) => set({ gender }),
}));
