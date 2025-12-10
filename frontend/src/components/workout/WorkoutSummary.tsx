'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Share2, Clock, Zap, Dumbbell, Play, Save, Home, RotateCcw } from 'lucide-react';

interface SummaryProps {
    workout: {
        exercises: any[];
        duration: number;
        intensity: string;
        goal: string;
    }
}

export function WorkoutSummary({ workout }: SummaryProps) {
    const router = useRouter();

    if (!workout?.exercises) return <div className="text-center p-10">Loading Plan...</div>;

    const handleStartWorkout = () => {
        // TODO: Save workout to history with "in_progress" status
        // For now, just show alert
        alert('Starting workout! (Session tracking coming soon)');
    };

    const handleSaveForLater = () => {
        // TODO: Save workout to history with "planned" status
        alert('Workout saved! (History feature coming soon)');
        router.push('/history');
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
                    <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                        Your Personalized Plan
                    </h1>
                    <p className="text-muted-foreground mt-1 capitalize">
                        {workout.goal.replace('_', ' ')} Focus • {workout.intensity} Intensity
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-2">
                        <Share2 className="w-4 h-4" /> Share
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                        <Download className="w-4 h-4" /> Save PDF
                    </Button>
                </div>
            </motion.div>

            {/* Stats Bar */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
                {[
                    { label: 'Duration', val: `${workout.duration}m`, icon: Clock },
                    { label: 'Exercises', val: workout.exercises.length, icon: Dumbbell },
                    { label: 'Intensity', val: workout.intensity, icon: Zap },
                ].map((stat, i) => (
                    <Card key={i} className="p-4 bg-white/5 border-white/10 flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-full text-primary">
                            <stat.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase">{stat.label}</p>
                            <p className="font-bold text-lg capitalize">{stat.val}</p>
                        </div>
                    </Card>
                ))}
            </motion.div>

            {/* Exercise List */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Dumbbell className="w-5 h-5 text-primary" /> Exercise Routine
                </h2>
                <div className="grid gap-4">
                    {workout.exercises.map((ex, i) => (
                        <motion.div
                            key={ex.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + (i * 0.1) }}
                        >
                            <Card className="p-0 overflow-hidden border-white/5 bg-card/40 hover:bg-card/60 transition-colors group">
                                <div className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
                                    <div className="flex-shrink-0 w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center font-bold text-primary text-lg">
                                        {i + 1}
                                    </div>

                                    <div className="flex-grow space-y-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                                                {ex.name}
                                            </h3>
                                            <Badge variant="secondary" className="uppercase text-[10px] tracking-wider">
                                                {ex.muscleGroup || 'General'}
                                            </Badge>
                                        </div>
                                        <div className="flex gap-4 text-sm text-muted-foreground">
                                            <span>{ex.sets} Sets</span>
                                            <span>•</span>
                                            <span>{ex.reps} Reps</span>
                                            <span>•</span>
                                            <span>{ex.rest}s Rest</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Instructions Preview */}
                                <div className="bg-black/20 p-4 px-6 text-sm text-muted-foreground border-t border-white/5">
                                    <ul className="list-disc list-inside space-y-1">
                                        {ex.instructions?.slice(0, 2).map((inst: string, idx: number) => (
                                            <li key={idx}>{inst}</li>
                                        ))}
                                    </ul>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Action Buttons */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/10"
            >
                <Button
                    size="lg"
                    className="flex-1 gap-2 h-14 text-lg"
                    onClick={handleStartWorkout}
                >
                    <Play className="w-5 h-5" />
                    Start Workout
                </Button>
                <Button
                    variant="outline"
                    size="lg"
                    className="flex-1 gap-2 h-14"
                    onClick={handleSaveForLater}
                >
                    <Save className="w-5 h-5" />
                    Save for Later
                </Button>
                <Button
                    variant="ghost"
                    size="lg"
                    className="gap-2"
                    onClick={() => router.push('/')}
                >
                    <Home className="w-5 h-5" />
                    Home
                </Button>
                <Button
                    variant="ghost"
                    size="lg"
                    className="gap-2"
                    onClick={() => router.push('/generator/muscle-selection')}
                >
                    <RotateCcw className="w-5 h-5" />
                    Generate Another
                </Button>
            </motion.div>
        </div>
    );
}

