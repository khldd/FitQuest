'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { TrendsData } from '@/types/analytics';
import { formatDate } from '@/lib/analytics-utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useState } from 'react';

interface WorkoutFrequencyChartProps {
  data: TrendsData;
}

type MetricType = 'workouts' | 'duration' | 'points';

export function WorkoutFrequencyChart({ data }: WorkoutFrequencyChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('workouts');

  const metrics = [
    { value: 'workouts', label: 'Workouts', color: '#3b82f6' },
    { value: 'duration', label: 'Duration (min)', color: '#8b5cf6' },
    { value: 'points', label: 'Points', color: '#10b981' },
  ] as const;

  // Transform data for chart
  const chartData = data.data.map((point) => ({
    date: formatDate(point.date),
    workouts: point.workouts,
    duration: point.duration,
    points: point.points,
  }));

  const selectedMetricConfig = metrics.find((m) => m.value === selectedMetric);

  return (
    <Card className="p-6">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Workout Frequency</h3>
          <p className="text-sm text-muted-foreground">
            Track your workout activity over time
          </p>
        </div>
        <div className="flex gap-2">
          {metrics.map((metric) => (
            <Button
              key={metric.value}
              variant={selectedMetric === metric.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedMetric(metric.value as MetricType)}
            >
              {metric.label}
            </Button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <defs>
            <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={selectedMetricConfig?.color}
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor={selectedMetricConfig?.color}
                stopOpacity={0.1}
              />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="date"
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            labelStyle={{ color: 'hsl(var(--popover-foreground))' }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey={selectedMetric}
            stroke={selectedMetricConfig?.color}
            strokeWidth={2}
            fill="url(#colorMetric)"
            dot={{ fill: selectedMetricConfig?.color, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
