'use client';

import { Card } from '@/components/ui/card';
import type { DayOfWeekBreakdown } from '@/types/analytics';
import { getDayAbbreviation } from '@/lib/analytics-utils';
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

interface DayOfWeekChartProps {
  data: DayOfWeekBreakdown;
}

export function DayOfWeekChart({ data }: DayOfWeekChartProps) {
  // Days of week in order
  const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Transform data for chart
  const chartData = daysOrder.map((day) => ({
    day: getDayAbbreviation(day),
    count: data[day as keyof DayOfWeekBreakdown],
  }));

  // Find max count to highlight most active day
  const maxCount = Math.max(...chartData.map((d) => d.count));

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Activity by Day of Week</h3>
        <p className="text-sm text-muted-foreground">
          Your most active workout days
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="day"
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
            formatter={(value: number) => [`${value} workouts`, 'Count']}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.count === maxCount && maxCount > 0 ? '#3b82f6' : '#94a3b8'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
