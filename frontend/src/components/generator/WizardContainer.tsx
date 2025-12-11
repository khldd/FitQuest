'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Wand2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { WizardProgress } from './WizardProgress';
import { IntensityStep } from './IntensityStep';
import { GoalStep } from './GoalStep';
import { ParametersStep } from './ParametersStep';

import { useWorkoutConfigStore } from '@/store/workout-config-store';
import { useMuscleStore } from '@/store/muscle-store';
import { useWorkoutSessionStore } from '@/store/workout-session-store';
import { workoutAPI } from '@/lib/api-client';

export function WizardContainer() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState('');
    const totalSteps = 3;

    // Stores to check valid state before proceeding
    const { intensity, goal, setting, duration } = useWorkoutConfigStore();
    const { selectedMuscles } = useMuscleStore();
    const { setWorkout } = useWorkoutSessionStore();

    const nextStep = () => {
        if (step < totalSteps) setStep(step + 1);
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
        else router.back(); // Go back to muscle selection
    };

    const isStepValid = () => {
        if (step === 1) return !!intensity;
        if (step === 2) return !!goal;
        return true; // Step 3 always has defaults
    };

    const handleGenerate = async () => {
        if (selectedMuscles.length === 0) {
            setError('Please select at least one muscle group');
            return;
        }

        setIsGenerating(true);
        setError('');

        try {
            // Call the API to generate workout
            const response = await workoutAPI.generateWorkout({
                muscles_targeted: selectedMuscles,
                duration: duration,
                intensity: intensity as 'light' | 'moderate' | 'intense',
                goal: goal as 'strength' | 'hypertrophy' | 'endurance',
                equipment: setting as 'bodyweight' | 'home' | 'gym'
            });

            // Store the entire workout plan in session store
            if (response.workout_plan) {
                console.log('Storing workout plan:', response.workout_plan);
                setWorkout(response.workout_plan);
            } else {
                console.error('No workout_plan in response:', response);
            }

            // Navigate to the workout display page
            router.push('/workout/active');
        } catch (err: any) {
            console.error('Failed to generate workout:', err);
            setError(err.response?.data?.message || 'Failed to generate workout. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-card border border-border shadow-2xl rounded-3xl p-6 md:p-12 relative overflow-hidden backdrop-blur-xl bg-opacity-80">

                {/* Background blobs for depth */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-secondary/20 blur-[100px] rounded-full pointer-events-none" />

                <WizardProgress currentStep={step} totalSteps={totalSteps} />

                <div className="min-h-[400px] flex flex-col justify-between relative z-10">
                    <AnimatePresence mode="wait">
                        {step === 1 && <IntensityStep key="step1" />}
                        {step === 2 && <GoalStep key="step2" />}
                        {step === 3 && <ParametersStep key="step3" />}
                    </AnimatePresence>

                    {error && (
                        <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-between mt-8 pt-8 border-t border-border/50">
                        <Button variant="ghost" onClick={prevStep} disabled={isGenerating} className="gap-2">
                            <ArrowLeft className="w-4 h-4" /> Back
                        </Button>

                        {step < totalSteps ? (
                            <Button onClick={nextStep} disabled={!isStepValid()} className="gap-2">
                                Next <ArrowRight className="w-4 h-4" />
                            </Button>
                        ) : (
                            <Button 
                                onClick={handleGenerate} 
                                disabled={isGenerating}
                                className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-500 text-white border-0 shadow-lg shadow-primary/25"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                                    </>
                                ) : (
                                    <>
                                        <Wand2 className="w-4 h-4" /> Generate Workout
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
