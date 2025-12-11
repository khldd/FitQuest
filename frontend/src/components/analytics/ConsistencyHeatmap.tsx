'use client';

import { Card } from '@/components/ui/card';
import type { WorkoutCalendarDay } from '@/types/analytics';
import { getHeatmapColor, getHeatIntensity, formatDate } from '@/lib/analytics-utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ConsistencyHeatmapProps {
  data: WorkoutCalendarDay[];
}

export function ConsistencyHeatmap({ data }: ConsistencyHeatmapProps) {
  // Group days by week
  const weeks: WorkoutCalendarDay[][] = [];
  let currentWeek: WorkoutCalendarDay[] = [];

  data.forEach((day, index) => {
    currentWeek.push(day);
    // Start new week on Sunday or at the end
    if (new Date(day.date).getDay() === 0 || index === data.length - 1) {
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  });

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Workout Consistency</h3>
        <p className="text-sm text-muted-foreground">
          Daily workout activity heatmap
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-flex gap-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day) => {
                const intensity = getHeatIntensity(day.workout_count);
                const color = getHeatmapColor(intensity);

                return (
                  <TooltipProvider key={day.date}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className="h-3 w-3 rounded-sm transition-all hover:ring-2 hover:ring-primary hover:ring-offset-1"
                          style={{ backgroundColor: color }}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-xs">
                          <div className="font-semibold">
                            {formatDate(day.date, 'long')}
                          </div>
                          <div className="text-muted-foreground">
                            {day.workout_count > 0
                              ? `${day.workout_count} workout${day.workout_count > 1 ? 's' : ''} (${day.total_points} pts)`
                              : 'No workouts'}
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: getHeatmapColor(level) }}
            />
          ))}
        </div>
        <span>More</span>
      </div>
    </Card>
  );
}
