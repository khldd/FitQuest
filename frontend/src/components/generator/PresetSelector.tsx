'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { presetsAPI } from '@/lib/api-client';
import { WorkoutPreset } from '@/types/preset';
import { useMuscleStore } from '@/store/muscle-store';
import {
  Dumbbell,
  Zap,
  Flame,
  Target,
  Sparkles,
  TrendingUp,
  Trophy
} from 'lucide-react';
import { cn } from '@/lib/utils';

const PRESET_ICONS: Record<string, React.ElementType> = {
  'Push Day': Dumbbell,
  'Pull Day': TrendingUp,
  'Leg Day': Flame,
  'Full Body': Target,
  'Upper Body': Sparkles,
  'Core & Abs': Zap,
  'Arms Blaster': Trophy,
};

const LEVEL_COLORS: Record<string, string> = {
  beginner: 'bg-green-500/10 text-green-500 border-green-500/20',
  intermediate: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  advanced: 'bg-red-500/10 text-red-500 border-red-500/20',
};

interface PresetSelectorProps {
  onPresetSelect?: () => void;
}

export function PresetSelector({ onPresetSelect }: PresetSelectorProps) {
  const [presets, setPresets] = useState<WorkoutPreset[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { clearSelection, toggleMuscle, selectedMuscles } = useMuscleStore();

  useEffect(() => {
    const fetchPresets = async () => {
      try {
        setIsLoading(true);
        const data = await presetsAPI.getAll({ ordering: 'name' });
        setPresets(data.results || []);
      } catch (error) {
        console.error('Failed to fetch presets:', error);
        setPresets([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPresets();
  }, []);

  const handlePresetClick = (preset: WorkoutPreset) => {
    // Clear current selection
    clearSelection();

    // Select the preset's muscle groups
    preset.muscle_groups.forEach((muscle) => {
      toggleMuscle(muscle);
    });

    // Mark this preset as selected
    setSelectedPreset(preset.id);

    // Call the callback if provided
    if (onPresetSelect) {
      onPresetSelect();
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-12 w-12 bg-muted rounded-full mb-4" />
            <div className="h-4 bg-muted rounded mb-2 w-3/4" />
            <div className="h-3 bg-muted rounded w-full" />
          </Card>
        ))}
      </div>
    );
  }

  if (presets.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No presets available</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Quick Start Presets</h3>
        <p className="text-sm text-muted-foreground">
          Select a preset to quickly configure your workout, or customize below
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {presets.map((preset) => {
          const Icon = PRESET_ICONS[preset.name] || Dumbbell;
          const isSelected = selectedPreset === preset.id;

          return (
            <Card
              key={preset.id}
              className={cn(
                'p-6 cursor-pointer transition-all hover:shadow-lg border-2',
                isSelected
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-transparent hover:border-primary/50'
              )}
              onClick={() => handlePresetClick(preset)}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={cn(
                    'p-3 rounded-full',
                    isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <Badge
                  variant="outline"
                  className={cn('text-xs', LEVEL_COLORS[preset.recommended_level])}
                >
                  {preset.recommended_level}
                </Badge>
              </div>

              <h4 className="font-semibold text-base mb-2">{preset.name}</h4>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {preset.description}
              </p>

              <div className="flex flex-wrap gap-1 mb-4">
                {preset.muscle_groups.slice(0, 3).map((muscle, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {muscle}
                  </Badge>
                ))}
                {preset.muscle_groups.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{preset.muscle_groups.length - 3}
                  </Badge>
                )}
              </div>

              {isSelected && (
                <div className="text-xs text-primary font-medium">
                  ✓ Selected
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {selectedPreset && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4" />
          <span>
            Preset applied! You can now adjust muscles or continue to configure your workout.
          </span>
        </div>
      )}
    </div>
  );
}
