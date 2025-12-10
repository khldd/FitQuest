'use client';

import { Button } from '@/components/ui/button';
import { MuscleView } from '@/types/muscle';
import { ArrowRightLeft } from 'lucide-react';



interface ViewToggleProps {
    currentView: MuscleView;
    onToggle: (view: MuscleView) => void;
}

export function ViewToggle({ currentView, onToggle }: ViewToggleProps) {
    return (
        <div className="flex gap-4 items-center bg-secondary/50 p-2 rounded-full backdrop-blur-sm border border-white/5">
            <Button
                variant={currentView === 'front' ? 'default' : 'ghost'}
                className="rounded-full px-6 transition-all duration-300"
                onClick={() => onToggle('front')}
            >
                Front
            </Button>
            <div
                className="p-2 bg-black/20 rounded-full cursor-pointer hover:bg-black/40 transition-colors"
                onClick={() => onToggle(currentView === 'front' ? 'back' : 'front')}
            >
                <ArrowRightLeft className="w-4 h-4 text-muted-foreground" />
            </div>
            <Button
                variant={currentView === 'back' ? 'default' : 'ghost'}
                className="rounded-full px-6 transition-all duration-300"
                onClick={() => onToggle('back')}
            >
                Back
            </Button>
        </div>
    );
}
