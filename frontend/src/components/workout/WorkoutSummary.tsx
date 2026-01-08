'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Share2, Clock, Zap, Dumbbell, Save, Home, RotateCcw, Loader2, Trophy } from 'lucide-react';
import { workoutAPI, socialAPI } from '@/lib/api-client';
import { useWorkoutConfigStore } from '@/store/workout-config-store';
import { useMuscleStore } from '@/store/muscle-store';
import { toast } from 'sonner';

interface SummaryProps {
    workout: {
        exercises: any[];
        duration: number;
        intensity: string;
        goal: string;
        muscles_targeted?: string[];
        equipment?: string;
    }
}

export function WorkoutSummary({ workout }: SummaryProps) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [error, setError] = useState('');
    
    const { setting } = useWorkoutConfigStore();
    const { selectedMuscles } = useMuscleStore();

    if (!workout?.exercises) return <div className="text-center p-10">Loading Plan...</div>;

    const handleSaveForLater = async () => {
        setIsSaving(true);
        setError('');

        const payload = {
            muscles_targeted: workout.muscles_targeted || selectedMuscles,
            duration: (workout as any).estimated_duration || workout.duration,
            intensity: workout.intensity,
            goal: workout.goal,
            equipment: workout.equipment || setting || 'gym',
            exercises_completed: workout.exercises,
            status: 'planned' as const
        };

        console.log('Sending workout data:', JSON.stringify(payload, null, 2));

        try {
            const response = await workoutAPI.createHistory(payload);

            // Check for newly unlocked achievements
            if (response.newly_unlocked_achievements && response.newly_unlocked_achievements.length > 0) {
                response.newly_unlocked_achievements.forEach((achievement: any) => {
                    toast.success(`🏆 Achievement Unlocked: ${achievement.name}!`, {
                        description: `${achievement.description} (+${achievement.points} XP)`,
                        duration: 5000,
                    });
                });
            }

            toast.success('Workout saved for later!');
            router.push('/history');
        } catch (err: any) {
            console.error('Failed to save workout:', err);
            console.error('Error response:', err.response?.data);
            setError('Failed to save workout. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleShare = async () => {
        setIsSharing(true);
        try {
            // Create a shareable text summary
            const workoutSummary = `
🏋️ My Workout Plan

📊 Stats:
• ${workout.exercises.length} exercises
• ${workout.duration} minutes
• ${workout.intensity} intensity
• ${workout.goal.replace('_', ' ')} focus

💪 Exercises:
${workout.exercises.map((ex, i) => `${i + 1}. ${ex.name} - ${ex.sets}x${ex.reps}`).join('\n')}

Generated with FitQuest 💪
            `.trim();

            // Use Web Share API if available
            if (navigator.share) {
                await navigator.share({
                    title: 'My Workout Plan',
                    text: workoutSummary,
                });
            } else {
                // Fallback: copy to clipboard
                await navigator.clipboard.writeText(workoutSummary);
                alert('Workout copied to clipboard!');
            }
        } catch (err) {
            console.error('Failed to share:', err);
            alert('Failed to share workout');
        } finally {
            setIsSharing(false);
        }
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
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-2"
                        onClick={handleShare}
                        disabled={isSharing}
                    >
                        {isSharing ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Sharing...</>
                        ) : (
                            <><Share2 className="w-4 h-4" /> Share</>
                        )}
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

            {/* Error Message */}
            {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    {error}
                </div>
            )}

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
                                    {/* Exercise Image/GIF */}
                                    {(ex.gif_url || ex.image_url) ? (
                                        <div className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden bg-black/20 border border-white/10">
                                            <img
                                                src={ex.gif_url || ex.image_url}
                                                alt={ex.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    // Fallback to number badge if image fails to load
                                                    e.currentTarget.style.display = 'none';
                                                    const parent = e.currentTarget.parentElement;
                                                    if (parent) {
                                                        parent.innerHTML = `<div class="w-full h-full bg-primary/20 rounded-lg flex items-center justify-center font-bold text-primary text-2xl">${i + 1}</div>`;
                                                    }
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex-shrink-0 w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center font-bold text-primary text-lg">
                                            {i + 1}
                                        </div>
                                    )}

                                    <div className="flex-grow space-y-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                                                {ex.name}
                                            </h3>
                                            <Badge variant="secondary" className="uppercase text-[10px] tracking-wider">
                                                {ex.primary_muscle || 'General'}
                                            </Badge>
                                        </div>
                                        <div className="flex gap-4 text-sm text-muted-foreground">
                                            <span>{ex.sets} Sets</span>
                                            <span>•</span>
                                            <span>{ex.reps} Reps</span>
                                            <span>•</span>
                                            <span>{ex.rest_seconds}s Rest</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Instructions Preview */}
                                {ex.instructions && ex.instructions.length > 0 && (
                                    <div className="bg-black/20 p-4 px-6 text-sm text-muted-foreground border-t border-white/5">
                                        <ul className="list-disc list-inside space-y-1">
                                            {ex.instructions.slice(0, 2).map((inst: string, idx: number) => (
                                                <li key={idx}>{inst}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
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
                    variant="default"
                    size="lg"
                    className="flex-1 gap-2 h-14"
                    onClick={handleSaveForLater}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            Save Workout
                        </>
                    )}
                </Button>
                <Button
                    variant="ghost"
                    size="lg"
                    className="gap-2"
                    onClick={() => router.push('/')}
                    disabled={isSaving}
                >
                    <Home className="w-5 h-5" />
                    Home
                </Button>
                <Button
                    variant="ghost"
                    size="lg"
                    className="gap-2"
                    onClick={() => router.push('/generator/muscle-selection')}
                    disabled={isSaving}
                >
                    <RotateCcw className="w-5 h-5" />
                    Generate Another
                </Button>
            </motion.div>
        </div>
    );
}

