'use client';

import { Progress } from '@/components/ui/progress';

export function WizardProgress({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
    const progress = (currentStep / totalSteps) * 100;

    return (
        <div className="w-full max-w-md mx-auto mb-8">
            <div className="flex justify-between text-xs text-muted-foreground mb-2 px-1">
                <span>Step {currentStep} of {totalSteps}</span>
                <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
        </div>
    );
}
