'use client';

import { Card } from '@/components/ui/card';
import type { MuscleAnalytics } from '@/types/analytics';
import { getMuscleColor } from '@/lib/analytics-utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface MuscleDistributionChartProps {
  data: MuscleAnalytics;
}

export function MuscleDistributionChart({ data }: MuscleDistributionChartProps) {
  // Transform data for chart
  const chartData = data.muscle_frequency.map((muscle) => ({
    name: muscle.muscle,
    count: muscle.count,
    percentage: muscle.percentage,
    color: getMuscleColor(muscle.muscle),
  }));

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Muscle Group Distribution</h3>
        <p className="text-sm text-muted-foreground">
          Most frequently targeted muscle groups
        </p>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            type="number"
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <YAxis
            type="category"
            dataKey="name"
            className="text-xs"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
            formatter={(value: number, name: string, props: any) => [
              `${value} workouts (${props.payload.percentage}%)`,
              'Count',
            ]}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
