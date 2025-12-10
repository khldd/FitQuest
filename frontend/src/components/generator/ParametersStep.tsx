'use client';

import { motion } from 'framer-motion';
import { useWorkoutConfigStore, Setting } from '@/store/workout-config-store';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Building2, Home, User } from 'lucide-react';

export function ParametersStep() {
    const { duration, setDuration, setting, setSetting } = useWorkoutConfigStore();

    const settings = [
        {
            value: 'gym',
            label: 'Full Gym',
            icon: Building2,
            desc: 'Access to machines, cables, free weights.'
        },
        {
            value: 'home',
            label: 'Home Gym',
            icon: Home,
            desc: 'Dumbbells, bands, and basic equipment.'
        },
        {
            value: 'bodyweight',
            label: 'Bodyweight',
            icon: User,
            desc: 'No equipment needed. Train anywhere.'
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
        >
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Details & Setting</h2>
                <p className="text-muted-foreground">Fine-tune your session context.</p>
            </div>

            {/* Duration Slider */}
            <div className="space-y-4 p-6 border rounded-xl bg-black/20">
                <div className="flex justify-between items-center">
                    <Label className="text-lg font-medium">Duration</Label>
                    <span className="text-2xl font-bold ml-2 text-primary">{duration} <span className="text-sm text-muted-foreground font-normal">min</span></span>
                </div>
                <Slider
                    value={[duration]}
                    onValueChange={(val) => setDuration(val[0])}
                    max={120}
                    min={15}
                    step={5}
                    className="py-4"
                />
                <div className="flex justify-between text-xs text-muted-foreground px-1">
                    <span>15m</span>
                    <span>60m</span>
                    <span>120m</span>
                </div>
            </div>

            {/* Environment Setting */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Training Environment</h3>

                <RadioGroup
                    value={setting || 'gym'}
                    onValueChange={(val: Setting) => setSetting(val)}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                    {settings.map((s) => (
                        <div key={s.value}>
                            <RadioGroupItem value={s.value} id={s.value} className="peer sr-only" />
                            <Label
                                htmlFor={s.value}
                                className="flex flex-col items-center justify-between p-6 h-full rounded-xl border-2 border-muted bg-card hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all duration-200"
                            >
                                <s.icon className="w-8 h-8 mb-4 text-primary" />
                                <div className="text-center space-y-1">
                                    <span className="font-semibold">{s.label}</span>
                                    <p className="text-xs text-muted-foreground leading-snug">
                                        {s.desc}
                                    </p>
                                </div>
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
            </div>
        </motion.div>
    );
}
