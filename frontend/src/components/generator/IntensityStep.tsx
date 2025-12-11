'use client';

import { motion } from 'framer-motion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

import { Zap, Flame, Skull } from 'lucide-react';
import { useWorkoutConfigStore, Intensity } from '@/store/workout-config-store';

export function IntensityStep() {
    const { intensity, setIntensity } = useWorkoutConfigStore();

    const options = [
        { value: 'light', label: 'Light', icon: Zap, desc: 'Active recovery, mobility, low impact.' },
        { value: 'moderate', label: 'Moderate', icon: Flame, desc: 'Hypertrophy focused, challenging but manageable.' },
        { value: 'intense', label: 'Intense', icon: Skull, desc: 'High intensity, failure testing, max effort.' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Select Intensity</h2>
                <p className="text-muted-foreground">How hard do you want to push today?</p>
            </div>

            <RadioGroup
                value={intensity || ''}
                onValueChange={(val: Intensity) => setIntensity(val)}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
                {options.map((opt) => (
                    <div key={opt.value}>
                        <RadioGroupItem value={opt.value} id={opt.value} className="peer sr-only" />
                        <Label
                            htmlFor={opt.value}
                            className="flex flex-col items-center justify-between p-6 h-full rounded-xl border-2 border-muted bg-popover hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all duration-200"
                        >
                            <opt.icon className="w-8 h-8 mb-4 text-primary" />
                            <div className="text-center space-y-1">
                                <span className="font-semibold text-lg">{opt.label}</span>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {opt.desc}
                                </p>
                            </div>
                        </Label>
                    </div>
                ))}
            </RadioGroup>
        </motion.div>
    );
}
