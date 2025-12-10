'use client';

import { motion } from 'framer-motion';
import { Muscle } from '@/types/muscle';
import { cn } from '@/lib/utils';

interface MusclePathProps {
    muscle: Muscle;
    isSelected: boolean;
    onToggle: (id: string) => void;
}

export function MusclePath({ muscle, isSelected, onToggle }: MusclePathProps) {
    return (
        <motion.g
            onClick={() => onToggle(muscle.id)}
            initial={false}
            animate={{
                scale: isSelected ? 1.02 : 1,
                opacity: 1,
            }}
            whileHover={{ scale: 1.03, cursor: 'pointer' }}
            whileTap={{ scale: 0.98 }}
            className="group"
        >
            <motion.path
                d={muscle.path}
                className={cn(
                    "stroke-white/10 stroke-1 transition-colors duration-300 ease-in-out",
                    isSelected
                        ? "fill-primary stroke-primary/50 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                        : "fill-white/5 hover:fill-white/10"
                )}
            />
            {/* Optional Label on Hover usually, but simple glow is better for now */}
        </motion.g>
    );
}
