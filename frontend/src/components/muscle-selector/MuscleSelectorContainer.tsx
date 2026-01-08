'use client';

import { useMuscleStore } from '@/store/muscle-store';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { PresetSelector } from '@/components/generator/PresetSelector';
import { InteractiveAnatomy } from './InteractiveAnatomy';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogHeader
} from "@/components/ui/dialog";
import { Sparkles, ArrowRight, X } from 'lucide-react';
import { useState } from 'react';

export function MuscleSelectorContainer() {
    const router = useRouter();
    const { selectedMuscles, toggleMuscle, clearSelection } = useMuscleStore();
    const [presetOpen, setPresetOpen] = useState(false);

    return (
        <div className="flex h-[calc(100vh-5rem)] flex-col lg:flex-row overflow-hidden bg-white">
            {/* Main Area: Figure */}
            <div className="flex-1 relative bg-gray-50/50 flex flex-col">
                 <div className="absolute top-4 left-4 z-10">
                    <Dialog open={presetOpen} onOpenChange={setPresetOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="gap-2 bg-white hover:bg-white shadow-sm hover:shadow-md transition-all border-gray-200">
                                <Sparkles className="w-4 h-4 text-indigo-500" />
                                <span>Load Preset</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Workout Presets</DialogTitle>
                                <DialogDescription>Choose a template to get started quickly.</DialogDescription>
                            </DialogHeader>
                            <div className="pt-4">
                                <PresetSelector onPresetSelect={() => setPresetOpen(false)} />
                            </div>
                        </DialogContent>
                    </Dialog>
                 </div>
                 
                 <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
                    <InteractiveAnatomy 
                        selectedMuscles={selectedMuscles} 
                        onToggle={toggleMuscle}
                        className="max-w-[500px]" 
                    />
                 </div>
                 
                 <div className="absolute bottom-4 left-0 right-0 text-center text-sm text-gray-400 pointer-events-none pb-4">
                    Click on muscles to select them
                 </div>
            </div>

            {/* Right: Selection Panel (Sidebar) */}
            <div className="w-full lg:w-96 border-l border-gray-100 bg-white shadow-[0_0_20px_rgba(0,0,0,0.03)] flex flex-col z-20">
                <div className="p-6 border-b border-gray-50">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Target Muscles</h2>
                            <p className="text-sm text-gray-500">Select at least one muscle group</p>
                        </div>
                        {selectedMuscles.length > 0 && (
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={clearSelection}
                                className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                            >
                                Clear
                            </Button>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {selectedMuscles.length === 0 ? (
                         <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 space-y-4">
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                                <span className="text-2xl opacity-50">💪</span>
                            </div>
                            <p>No muscles selected.</p>
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2 content-start">
                            {selectedMuscles.map((muscle) => (
                                <Badge 
                                    key={muscle}
                                    variant="secondary"
                                    className="px-3 py-1.5 text-sm gap-2 hover:bg-gray-200 transition-colors animate-in zoom-in-50 duration-200"
                                >
                                    <span className="capitalize">{muscle}</span>
                                    <button
                                        onClick={() => toggleMuscle(muscle)}
                                        className="text-gray-400 hover:text-gray-700 ml-1 rounded-full hover:bg-gray-300/50 w-4 h-4 flex items-center justify-center transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50/30">
                    <Button
                        className="w-full h-12 text-base font-medium shadow-lg shadow-indigo-200/50 hover:shadow-indigo-200/80 transition-all bg-indigo-600 hover:bg-indigo-700"
                        disabled={selectedMuscles.length === 0}
                        onClick={() => router.push('/generator/config')}
                    >
                        Continue <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
