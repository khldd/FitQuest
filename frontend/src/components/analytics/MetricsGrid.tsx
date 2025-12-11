'use client';

import { Card } from '@/components/ui/card';
import type { SummaryMetrics } from '@/types/analytics';
import {
  formatDuration,
  formatNumber,
  formatPercentage,
} from '@/lib/analytics-utils';
import { Dumbbell, Clock, Trophy, Zap, TrendingUp, Flame } from 'lucide-react';

interface MetricsGridProps {
  metrics: SummaryMetrics;
}

export function MetricsGrid({ metrics }: MetricsGridProps) {
  const metricsData = [
    {
      label: 'Total Workouts',
      value: formatNumber(metrics.total_workouts),
      icon: Dumbbell,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Average Duration',
      value: formatDuration(metrics.avg_duration),
      icon: Clock,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: 'Total Points',
      value: formatNumber(metrics.total_points),
      suffix: ' pts',
      icon: Trophy,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      label: 'Avg Intensity',
      value: metrics.avg_intensity_score.toFixed(2),
      suffix: 'x',
      icon: Flame,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      label: 'Completion Rate',
      value: formatPercentage(metrics.completion_rate),
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Total Duration',
      value: formatDuration(metrics.total_duration),
      icon: Zap,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      {metricsData.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.label} className="p-4">
            <div className="space-y-2">
              <div className={`inline-flex rounded-lg ${metric.bgColor} p-2`}>
                <Icon className={`h-4 w-4 ${metric.color}`} />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {metric.value}
                  {metric.suffix && (
                    <span className="text-sm font-normal text-muted-foreground">
                      {metric.suffix}
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">{metric.label}</div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
