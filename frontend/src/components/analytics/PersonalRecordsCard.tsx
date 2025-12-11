'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { PersonalRecords } from '@/types/analytics';
import { formatDuration, formatDate, formatNumber } from '@/lib/analytics-utils';
import { Trophy, Clock, Zap, Target } from 'lucide-react';

interface PersonalRecordsCardProps {
  data: PersonalRecords;
}

export function PersonalRecordsCard({ data }: PersonalRecordsCardProps) {
  const records = [
    {
      label: 'Longest Workout',
      value: data.records.longest_workout
        ? formatDuration(data.records.longest_workout.duration!)
        : 'N/A',
      date: data.records.longest_workout?.date,
      icon: Clock,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: 'Highest Points',
      value: data.records.highest_points
        ? `${formatNumber(data.records.highest_points.points!)} pts`
        : 'N/A',
      date: data.records.highest_points?.date,
      icon: Trophy,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      label: 'Most Exercises',
      value: data.records.most_exercises
        ? `${data.records.most_exercises.count} exercises`
        : 'N/A',
      date: data.records.most_exercises?.date,
      icon: Zap,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Personal Records */}
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Personal Records</h3>
          <p className="text-sm text-muted-foreground">
            Your best performances
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {records.map((record) => {
            const Icon = record.icon;
            return (
              <div key={record.label} className="flex flex-col gap-2">
                <div className={`inline-flex w-fit rounded-lg ${record.bgColor} p-2`}>
                  <Icon className={`h-5 w-5 ${record.color}`} />
                </div>
                <div>
                  <div className="text-2xl font-bold">{record.value}</div>
                  <div className="text-xs text-muted-foreground">{record.label}</div>
                  {record.date && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {formatDate(record.date, 'long')}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Recent Milestones */}
      {data.recent_milestones.length > 0 && (
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Recent Milestones</h3>
            <p className="text-sm text-muted-foreground">
              Your latest achievements
            </p>
          </div>

          <div className="space-y-3">
            {data.recent_milestones.map((milestone, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    <Target className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">
                      {formatNumber(milestone.value)}{' '}
                      {milestone.type === 'total_workouts'
                        ? 'Workouts'
                        : 'Points'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(milestone.achieved_date, 'long')}
                    </div>
                  </div>
                </div>
                <Badge variant="secondary">Milestone</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
