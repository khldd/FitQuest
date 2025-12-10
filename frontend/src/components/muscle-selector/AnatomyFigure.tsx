'use client';

import { Muscle, MuscleView } from '@/types/muscle';
import { MusclePath } from './MusclePath';
import { motion, AnimatePresence } from 'framer-motion';

interface AnatomyFigureProps {
    muscles: Muscle[];
    selectedMuscles: string[]; // IDs
    onToggle: (id: string) => void;
    view: MuscleView;
}

export function AnatomyFigure({ muscles, selectedMuscles, onToggle, view }: AnatomyFigureProps) {
    // Filter muscles by view
    const visibleMuscles = muscles.filter((m) => m.view === view);

    return (
        <div className="relative w-full h-[600px] flex items-center justify-center">
            <AnimatePresence mode="wait">
                <motion.div
                    key={view}
                    initial={{ opacity: 0, rotateY: view === 'back' ? -15 : 15 }}
                    animate={{ opacity: 1, rotateY: 0 }}
                    exit={{ opacity: 0, rotateY: view === 'back' ? 15 : -15 }}
                    transition={{ duration: 0.4 }}
                    className="w-full max-w-[400px] aspect-[3/4]"
                >
                    <svg
                        viewBox="0 0 400 700"
                        className="w-full h-full drop-shadow-2xl"
                        style={{ filter: "drop-shadow(0px 0px 20px rgba(0,0,0,0.5))" }}
                    >
                        {/* Detailed Human Body Silhouette - Front/Back */}
                        <g className="fill-white/3 stroke-white/10 stroke-1 pointer-events-none">
                            {/* Head */}
                            <ellipse cx="200" cy="100" rx="40" ry="50" />

                            {/* Neck */}
                            <path d="M185,145 L215,145 L210,160 L190,160 Z" />

                            {/* Torso */}
                            <path d="M145,160 Q140,165 135,180 L130,200 Q128,250 135,280 L145,300 Q155,310 165,315 L180,320 L220,320 L235,315 Q245,310 255,300 L265,280 Q272,250 270,200 L265,180 Q260,165 255,160 L225,160 Q215,165 200,165 Q185,165 175,160 L145,160 Z" />

                            {/* Arms */}
                            <path d="M135,175 Q125,180 115,185 L105,200 L100,240 L105,280 L110,300 L108,350 Q107,365 110,380 L115,410 Q118,420 120,430 Q120,445 118,460 L115,480 Q113,495 115,510 L120,525 Q125,535 130,540 L135,540 Q138,535 138,525 L135,510 Q137,495 135,480 L132,460 Q130,445 132,430 Q135,420 138,410 L140,380 Q140,365 138,350 L140,300 L142,280 L145,240 L140,200 L135,185 L135,175 Z" />
                            <path d="M265,175 Q275,180 285,185 L295,200 L300,240 L295,280 L290,300 L292,350 Q293,365 290,380 L285,410 Q282,420 280,430 Q280,445 282,460 L285,480 Q287,495 285,510 L280,525 Q275,535 270,540 L265,540 Q262,535 262,525 L265,510 Q263,495 265,480 L268,460 Q270,445 268,430 Q265,420 262,410 L260,380 Q260,365 262,350 L260,300 L258,280 L255,240 L260,200 L265,185 L265,175 Z" />

                            {/* Legs */}
                            <path d="M165,320 Q160,330 157,345 L155,370 L152,405 L150,440 Q148,470 150,500 Q152,530 155,560 L158,590 Q160,610 162,630 L165,655 Q167,670 168,680 L170,690 Q172,695 175,695 L185,695 Q188,690 188,680 L185,655 Q183,635 182,615 L180,590 L178,560 Q176,530 178,500 Q180,470 178,440 L175,405 L172,370 L170,345 Q168,330 165,320 Z" />
                            <path d="M235,320 Q240,330 243,345 L245,370 L248,405 L250,440 Q252,470 250,500 Q248,530 245,560 L242,590 Q240,610 238,630 L235,655 Q233,670 232,680 L230,690 Q228,695 225,695 L215,695 Q212,690 212,680 L215,655 Q217,635 218,615 L220,590 L222,560 Q224,530 222,500 Q220,470 222,440 L225,405 L228,370 L230,345 Q232,330 235,320 Z" />
                        </g>

                        {visibleMuscles.map((muscle) => (
                            <MusclePath
                                key={muscle.id}
                                muscle={muscle}
                                isSelected={selectedMuscles.includes(muscle.id)}
                                onToggle={onToggle}
                            />
                        ))}
                    </svg>
                </motion.div>
            </AnimatePresence>

            {/* Decorative Floor Element */}
            <div className="absolute bottom-10 w-40 h-10 bg-black/40 blur-[40px] rounded-[100%]" />
        </div>
    );
}
