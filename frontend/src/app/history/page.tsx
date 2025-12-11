'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import {
    History,
    Dumbbell,
    Clock,
    Zap,
    CheckCircle2,
    Circle,
    Calendar,
    Filter,
    Plus,
    Loader2
} from 'lucide-react';
import { workoutAPI } from '@/lib/api-client';
import { useWorkoutSessionStore } from '@/store/workout-session-store';

interface WorkoutHistoryItem {
    id: number;
    workout_date: string;
    muscles_targeted: string[];
    duration: number;
    intensity: string;
    goal: string;
    equipment: string;
    exercises_completed: any[];
    status: 'planned' | 'in_progress' | 'completed';
    points_earned: number;
}

export default function HistoryPage() {
    const router = useRouter();
    const { setWorkout } = useWorkoutSessionStore();
    const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');
    const [workouts, setWorkouts] = useState<WorkoutHistoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadWorkoutHistory();
    }, []);

    const loadWorkoutHistory = async () => {
        setIsLoading(true);
        setError('');
        
        try {
            const response = await workoutAPI.getHistory();
            
            // Handle paginated response (Django REST Framework pagination)
            // Response can be either an array or {count, next, previous, results}
            let workoutData: WorkoutHistoryItem[] = [];
            
            if (Array.isArray(response)) {
                workoutData = response;
            } else if (response && response.results && Array.isArray(response.results)) {
                workoutData = response.results;
            }
            
            setWorkouts(workoutData);
        } catch (err: any) {
            console.error('Failed to load workout history:', err);
            console.error('Error response:', err.response?.data);
            setError('Failed to load workout history. Please try again.');
            setWorkouts([]);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredWorkouts = workouts.filter(w => {
        if (filter === 'completed') return w.status === 'completed';
        if (filter === 'pending') return w.status === 'planned' || w.status === 'in_progress';
        return true;
    });

    const totalPoints = workouts.reduce((sum, w) => sum + (w.points_earned || 0), 0);
    const completedCount = workouts.filter(w => w.status === 'completed').length;

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleCompleteWorkout = async (workoutId: number) => {
        try {
            await workoutAPI.updateHistory(workoutId, { status: 'completed' });
            // Reload the history
            await loadWorkoutHistory();
        } catch (err: any) {
            console.error('Failed to complete workout:', err);
            alert('Failed to mark workout as complete. Please try again.');
        }
    };

    const handleViewWorkout = (workout: WorkoutHistoryItem) => {
        // Convert the workout history to workout plan format
        const workoutPlan = {
            exercises: workout.exercises_completed,
            estimated_duration: workout.duration,
            intensity: workout.intensity,
            goal: workout.goal,
            equipment: workout.equipment,
            muscles_targeted: workout.muscles_targeted,
            total_exercises: workout.exercises_completed?.length || 0
        };
        
        // Store in session
        setWorkout(workoutPlan);
        
        // Navigate to workout view
        router.push('/workout/active');
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto p-6 flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
                        <History className="w-8 h-8 text-primary" />
                        Workout History
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Track your progress and review past workouts
                    </p>
                </div>
                <Button
                    onClick={() => router.push('/generator/muscle-selection')}
                    className="gap-2"
                >
                    <Plus className="w-4 h-4" />
                    New Workout
                </Button>
            </motion.div>

            {/* Error Message */}
            {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    {error}
                </div>
            )}

            {/* Stats Summary */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
                <Card className="p-4 bg-white/5 border-white/10">
                    <p className="text-xs text-muted-foreground uppercase">Total Workouts</p>
                    <p className="text-2xl font-bold">{workouts.length}</p>
                </Card>
                <Card className="p-4 bg-white/5 border-white/10">
                    <p className="text-xs text-muted-foreground uppercase">Completed</p>
                    <p className="text-2xl font-bold text-green-400">{completedCount}</p>
                </Card>
                <Card className="p-4 bg-white/5 border-white/10">
                    <p className="text-xs text-muted-foreground uppercase">Pending</p>
                    <p className="text-2xl font-bold text-yellow-400">{workouts.length - completedCount}</p>
                </Card>
                <Card className="p-4 bg-white/5 border-white/10">
                    <p className="text-xs text-muted-foreground uppercase">Total Points</p>
                    <p className="text-2xl font-bold text-primary">{totalPoints}</p>
                </Card>
            </motion.div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
                {(['all', 'completed', 'pending'] as const).map((f) => (
                    <Button
                        key={f}
                        variant={filter === f ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilter(f)}
                        className="capitalize"
                    >
                        {f}
                    </Button>
                ))}
            </div>

            {/* Workout List */}
            <div className="space-y-4">
                {filteredWorkouts.length === 0 ? (
                    <Card className="p-8 text-center bg-white/5 border-white/10">
                        <p className="text-muted-foreground">No workouts found</p>
                        <Button
                            variant="link"
                            onClick={() => router.push('/generator/muscle-selection')}
                        >
                            Generate your first workout
                        </Button>
                    </Card>
                ) : (
                    filteredWorkouts.map((workout, i) => (
                        <motion.div
                            key={workout.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 + (i * 0.05) }}
                        >
                            <Card className="p-0 overflow-hidden border-white/5 bg-card/40 hover:bg-card/60 transition-colors">
                                <div className="p-6 flex flex-col md:flex-row gap-4 items-start md:items-center">
                                    {/* Status Icon */}
                                    <div className={`
                                        p-3 rounded-full
                                        ${workout.status === 'completed'
                                            ? 'bg-green-500/20 text-green-400'
                                            : 'bg-yellow-500/20 text-yellow-400'
                                        }
                                    `}>
                                        {workout.status === 'completed'
                                            ? <CheckCircle2 className="w-6 h-6" />
                                            : <Circle className="w-6 h-6" />
                                        }
                                    </div>

                                    {/* Details */}
                                    <div className="flex-grow space-y-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-semibold">
                                                {formatDate(workout.workout_date)}
                                            </span>
                                            <Badge variant="secondary" className="capitalize">
                                                {workout.goal}
                                            </Badge>
                                            <Badge
                                                variant="outline"
                                                className={`capitalize ${workout.intensity === 'intense' ? 'border-red-500/50 text-red-400' :
                                                        workout.intensity === 'moderate' ? 'border-yellow-500/50 text-yellow-400' :
                                                            'border-green-500/50 text-green-400'
                                                    }`}
                                            >
                                                {workout.intensity}
                                            </Badge>
                                            {workout.status !== 'completed' && (
                                                <Badge variant="outline" className="border-yellow-500/50 text-yellow-400">
                                                    {workout.status === 'in_progress' ? 'In Progress' : 'Planned'}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {workout.muscles_targeted.map(m => (
                                                <Badge key={m} variant="secondary" className="text-xs">
                                                    {m}
                                                </Badge>
                                            ))}
                                        </div>
                                        <div className="flex gap-4 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {workout.duration}m
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Dumbbell className="w-4 h-4" />
                                                {workout.exercises_completed?.length || 0} exercises
                                            </span>
                                            {workout.status === 'completed' && (
                                                <span className="flex items-center gap-1 text-primary">
                                                    <Zap className="w-4 h-4" />
                                                    +{workout.points_earned} pts
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            onClick={() => handleViewWorkout(workout)}
                                        >
                                            View
                                        </Button>
                                        {workout.status !== 'completed' && (
                                            <Button 
                                                size="sm"
                                                onClick={() => handleCompleteWorkout(workout.id)}
                                            >
                                                Complete
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
