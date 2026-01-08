'use client';

import { useState } from 'react';
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
    Plus,
} from 'lucide-react';
import { useWorkouts, useWorkoutStats, WorkoutHistoryItem } from '@/lib/hooks';
import { AsyncDataWrapper, SkeletonList, SkeletonStats } from '@/components/ui/async-data-wrapper';
import { useWorkoutSessionStore } from '@/store/workout-session-store';
import { toast } from 'sonner';

export default function HistoryPage() {
    const router = useRouter();
    const { setWorkout } = useWorkoutSessionStore();
    const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');
    
    const { workouts, isLoading, error, refetch, completeWorkout } = useWorkouts();
    const { totalWorkouts, completedCount, pendingCount, totalPoints } = useWorkoutStats(workouts);

    const filteredWorkouts = workouts.filter(w => {
        if (filter === 'completed') return w.status === 'completed';
        if (filter === 'pending') return w.status === 'planned' || w.status === 'in_progress';
        return true;
    });

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleCompleteWorkout = async (workoutId: number) => {
        const result = await completeWorkout(workoutId);
        
        if (result.success) {
            // Check for newly unlocked achievements
            if (result.achievements && result.achievements.length > 0) {
                result.achievements.forEach((achievement: any) => {
                    toast.success(`🏆 Achievement Unlocked: ${achievement.name}!`, {
                        description: `${achievement.description} (+${achievement.points} XP)`,
                        duration: 5000,
                    });
                });
            }
            toast.success('Workout marked as complete!');
        } else {
            toast.error('Failed to mark workout as complete. Please try again.');
        }
    };

    const handleViewWorkout = (workout: WorkoutHistoryItem) => {
        // Convert the workout history to workout plan format
        const workoutPlan = {
            exercises: workout.exercises_completed,
            duration: workout.duration,
            intensity: workout.intensity,
            goal: workout.goal,
            equipment: workout.equipment,
            muscles_targeted: workout.muscles_targeted,
        };
        
        // Store in session
        setWorkout(workoutPlan);
        
        // Navigate to workout view
        router.push('/workout/active');
    };

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

            <AsyncDataWrapper
                data={workouts}
                isLoading={isLoading}
                error={error}
                onRetry={refetch}
                skeleton={
                    <div className="space-y-6">
                        <SkeletonStats count={4} />
                        <SkeletonList count={5} />
                    </div>
                }
                emptyComponent={
                    <Card className="p-8 text-center bg-white/5 border-white/10">
                        <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground mb-4">No workouts found</p>
                        <Button
                            variant="default"
                            onClick={() => router.push('/generator/muscle-selection')}
                        >
                            Generate your first workout
                        </Button>
                    </Card>
                }
            >
                {/* Stats Summary */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                    <Card className="p-4 bg-white/5 border-white/10">
                        <p className="text-xs text-muted-foreground uppercase">Total Workouts</p>
                        <p className="text-2xl font-bold">{totalWorkouts}</p>
                    </Card>
                    <Card className="p-4 bg-white/5 border-white/10">
                        <p className="text-xs text-muted-foreground uppercase">Completed</p>
                        <p className="text-2xl font-bold text-green-400">{completedCount}</p>
                    </Card>
                    <Card className="p-4 bg-white/5 border-white/10">
                        <p className="text-xs text-muted-foreground uppercase">Pending</p>
                        <p className="text-2xl font-bold text-yellow-400">{pendingCount}</p>
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
                            <p className="text-muted-foreground">No workouts match this filter</p>
                        </Card>
                    ) : (
                        filteredWorkouts.map((workout, i) => (
                            <motion.div
                                key={workout.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 + (i * 0.05) }}
                            >
                                <WorkoutCard
                                    workout={workout}
                                    onView={handleViewWorkout}
                                    onComplete={handleCompleteWorkout}
                                    formatDate={formatDate}
                                />
                            </motion.div>
                        ))
                    )}
                </div>
            </AsyncDataWrapper>
        </div>
    );
}

function WorkoutCard({
    workout,
    onView,
    onComplete,
    formatDate,
}: {
    workout: WorkoutHistoryItem;
    onView: (workout: WorkoutHistoryItem) => void;
    onComplete: (id: number) => void;
    formatDate: (date: string) => string;
}) {
    return (
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
                        onClick={() => onView(workout)}
                    >
                        View
                    </Button>
                    {workout.status !== 'completed' && (
                        <Button 
                            size="sm"
                            onClick={() => onComplete(workout.id)}
                        >
                            Complete
                        </Button>
                    )}
                </div>
            </div>
        </Card>
    );
}
