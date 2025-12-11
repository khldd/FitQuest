'use client';

import { Card } from '@/components/ui/card';
import type { IntensityBreakdown } from '@/types/analytics';
import { CHART_COLORS } from '@/lib/analytics-utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface IntensityDistributionChartProps {
  data: IntensityBreakdown;
}

export function IntensityDistributionChart({ data }: IntensityDistributionChartProps) {
  // Transform data for chart
  const chartData = [
    { name: 'Light', value: data.light, color: CHART_COLORS.intensity.light },
    { name: 'Moderate', value: data.moderate, color: CHART_COLORS.intensity.moderate },
    { name: 'Intense', value: data.intense, color: CHART_COLORS.intensity.intense },
  ].filter((item) => item.value > 0); // Only show non-zero values

  const total = data.light + data.moderate + data.intense;

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Intensity Distribution</h3>
        <p className="text-sm text-muted-foreground">
          Breakdown of workout intensity levels
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={5}
            dataKey="value"
            label={({ name, value }) => {
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
              return `${name} ${percentage}%`;
            }}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      <div className="mt-4 text-center">
        <div className="text-3xl font-bold">{total}</div>
        <div className="text-sm text-muted-foreground">Total Workouts</div>
      </div>
    </Card>
  );
}
