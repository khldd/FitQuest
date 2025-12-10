'use client';

import { motion } from 'framer-motion';
import { useWorkoutConfigStore, Goal } from '@/store/workout-config-store';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { BicepsFlexed, Mountain, Boxes, Timer } from 'lucide-react'; // Hypothetical icons

export function GoalStep() {
    const { goal, setGoal } = useWorkoutConfigStore();

    const goals = [
        { value: 'hypertrophy', label: 'Hypertrophy', icon: BicepsFlexed, desc: 'Focus on muscle growth and volume.' },
        { value: 'strength', label: 'Strength', icon: Mountain, desc: 'Low reps, high weight, max power.' },
        { value: 'fat_loss', label: 'Fat Loss', icon: Timer, desc: 'High heart rate, metabolic conditioning.' },
        { value: 'endurance', label: 'Endurance', icon: Boxes, desc: 'Sustained effort, higher reps.' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Training Goal</h2>
                <p className="text-muted-foreground">What are you aiming for?</p>
            </div>

            <RadioGroup
                value={goal || ''}
                onValueChange={(val: Goal) => setGoal(val)}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
                {goals.map((g) => (
                    <div key={g.value}>
                        <RadioGroupItem value={g.value} id={g.value} className="peer sr-only" />
                        <Label
                            htmlFor={g.value}
                            className="flex items-center space-x-4 p-6 rounded-xl border-2 border-muted bg-popover hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all duration-200"
                        >
                            <div className="p-3 bg-primary/10 rounded-full">
                                <g.icon className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <span className="font-semibold text-lg block">{g.label}</span>
                                <span className="text-sm text-muted-foreground">{g.desc}</span>
                            </div>
                        </Label>
                    </div>
                ))}
            </RadioGroup>
        </motion.div>
    );
}
