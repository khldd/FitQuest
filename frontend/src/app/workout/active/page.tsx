'use client';

import { useEffect } from 'react';
import { WorkoutSummary } from '@/components/workout/WorkoutSummary';
import { useWorkoutSessionStore } from '@/store/workout-session-store';
import { useWorkoutConfigStore } from '@/store/workout-config-store';

const MOCK_WORKOUT = [
    {
        id: '1',
        name: 'Bench Press',
        muscleGroup: 'Chest',
        sets: 3,
        reps: '8-10',
        rest: 60,
        instructions: ['Lie back on a flat bench.', 'Grip the bar slightly wider than shoulder width.', 'Lower bar to chest with control.', 'Press up strictly.']
    },
    {
        id: '2',
        name: 'Incline Dumbbell Fly',
        muscleGroup: 'Chest',
        sets: 3,
        reps: '12-15',
        rest: 45,
        instructions: ['Set bench to 30 degrees.', 'Open arms wide with slight bend in elbows.', 'Squeeze chest at the top.']
    },
    {
        id: '3',
        name: 'Tricep Pushdowns',
        muscleGroup: 'Triceps',
        sets: 4,
        reps: '15',
        rest: 30,
        instructions: ['Keep elbows pinned to sides.', 'Push down until arms are fully extended.', 'Control the eccentric.']
    }
];

export default function ActiveWorkoutPage() {
    const { workout, setWorkout } = useWorkoutSessionStore();
    const { intensity, goal, duration } = useWorkoutConfigStore();

    useEffect(() => {
        // In real app, we would fetch generated workout from API here
        // For now, we seed the mock workout if none exists
        if (!workout || workout.length === 0) {
            setWorkout(MOCK_WORKOUT);
        }
    }, [workout, setWorkout]);

    // Construct the summary object
    const summaryData = {
        exercises: workout.length > 0 ? workout : MOCK_WORKOUT,
        duration: duration || 45,
        intensity: intensity || 'medium',
        goal: goal || 'hypertrophy'
    };

    return <WorkoutSummary workout={summaryData} />;
}
