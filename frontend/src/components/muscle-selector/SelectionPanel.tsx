'use client';

import { Muscle } from '@/types/muscle';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Trophy, Dumbbell } from 'lucide-react';
import { useRouter } from 'next/navigation';


interface SelectionPanelProps {
    selectedMuscles: string[];
    allMuscles: Muscle[];
    onRemove: (id: string) => void;
    onClear: () => void;
}

export function SelectionPanel({ selectedMuscles, allMuscles, onRemove, onClear }: SelectionPanelProps) {
    const router = useRouter();
    const selectedDetails = allMuscles.filter(m => selectedMuscles.includes(m.id));

    // Group by muscle group logic could go here if needed

    return (
        <div className="h-full flex flex-col bg-card/50 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/5 bg-white/5">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                        <Dumbbell className="w-5 h-5 text-primary" />
                        Target Zone
                    </h2>
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                        {selectedMuscles.length} Selected
                    </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                    Select the muscles you want to target in this workout.
                </p>
            </div>

            <ScrollArea className="flex-1 p-6">
                {selectedDetails.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-10 opacity-50">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                            <Trophy className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Tap on the anatomy figure to select muscles.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3">
                        {selectedDetails.map((muscle) => (
                            <div
                                key={muscle.id}
                                className="group flex items-center justify-between p-3 rounded-lg bg-black/20 border border-white/5 hover:border-primary/50 transition-colors duration-200"
                            >
                                <div className="flex flex-col">
                                    <span className="font-medium text-sm">{muscle.name}</span>
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{muscle.group}</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                                    onClick={() => onRemove(muscle.id)}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>

            <div className="p-6 border-t border-white/5 bg-black/20">
                <Button
                    variant="secondary"
                    className="w-full mb-3"
                    onClick={onClear}
                    disabled={selectedMuscles.length === 0}
                >
                    Clear Selection
                </Button>
                <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                    disabled={selectedMuscles.length === 0}
                    onClick={() => router.push('/generator/config')}
                >
                    Confirm & Continue
                </Button>
            </div>
        </div>
    );
}
