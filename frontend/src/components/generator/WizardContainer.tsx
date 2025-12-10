'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Wand2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { WizardProgress } from './WizardProgress';
import { IntensityStep } from './IntensityStep';
import { GoalStep } from './GoalStep';
import { ParametersStep } from './ParametersStep';

import { useWorkoutConfigStore } from '@/store/workout-config-store';
import { useMuscleStore } from '@/store/muscle-store';

export function WizardContainer() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const totalSteps = 3;

    // Stores to check valid state before proceeding
    const { intensity, goal, setting } = useWorkoutConfigStore();
    const { selectedMuscles } = useMuscleStore();

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

    const handleGenerate = () => {
        console.log('Generating Workout with:', {
            muscles: selectedMuscles,
            config: { intensity, goal, setting }
        });
        // In the future, we will POST to backend here.
        // For now, redirect to the player which seeds the mock workout.
        router.push('/workout/active');
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

                    <div className="flex justify-between mt-8 pt-8 border-t border-border/50">
                        <Button variant="ghost" onClick={prevStep} className="gap-2">
                            <ArrowLeft className="w-4 h-4" /> Back
                        </Button>

                        {step < totalSteps ? (
                            <Button onClick={nextStep} disabled={!isStepValid()} className="gap-2">
                                Next <ArrowRight className="w-4 h-4" />
                            </Button>
                        ) : (
                            <Button onClick={handleGenerate} className="gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-500 text-white border-0 shadow-lg shadow-primary/25">
                                <Wand2 className="w-4 h-4" /> Generate Workout
                            </Button>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
