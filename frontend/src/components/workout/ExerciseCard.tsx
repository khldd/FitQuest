'use client';

import { motion } from 'framer-motion';
import { Exercise } from '@/store/workout-session-store';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ExerciseCardProps {
    exercise: Exercise;
}

export function ExerciseCard({ exercise }: ExerciseCardProps) {
    return (
        <motion.div
            key={exercise.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md mx-auto"
        >
            <Card className="overflow-hidden bg-card border-white/5 shadow-2xl">
                {/* Placeholder for Video/Animation */}
                <div className="h-64 bg-black/40 flex items-center justify-center relative">
                    <span className="text-white/20 font-bold text-4xl uppercase tracking-widest">
                        {exercise.muscleGroup || 'Exercise'}
                    </span>
                    <div className="absolute bottom-4 left-4">
                        <h2 className="text-2xl font-bold text-white drop-shadow-md">{exercise.name}</h2>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center text-sm font-medium text-muted-foreground">
                        <div className="flex gap-4">
                            <span className="text-primary flex items-center gap-1">
                                Target: <span className="text-foreground">{exercise.reps} Reps</span>
                            </span>
                            <span className="flex items-center gap-1">
                                Rest: <span className="text-foreground">{exercise.rest}s</span>
                            </span>
                        </div>
                    </div>

                    <Separator className="bg-white/5" />

                    <div className="space-y-2">
                        <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Instructions</h3>
                        <ul className="space-y-2">
                            {exercise.instructions?.map((inst, i) => (
                                <li key={i} className="text-sm text-foreground/80 flex gap-2">
                                    <span className="text-primary/50">•</span> {inst}
                                </li>
                            )) || <p className="text-sm text-muted-foreground">Perform the movement with control.</p>}
                        </ul>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}
