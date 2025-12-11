'use client';

import { Card } from '@/components/ui/card';
import type { GoalBreakdown } from '@/types/analytics';
import { getGoalColor } from '@/lib/analytics-utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface GoalBreakdownChartProps {
  data: GoalBreakdown;
}

export function GoalBreakdownChart({ data }: GoalBreakdownChartProps) {
  // Transform data for chart
  const chartData = Object.entries(data)
    .map(([goal, count]) => ({
      name: goal.charAt(0).toUpperCase() + goal.slice(1).replace('_', ' '),
      value: count || 0,
      color: getGoalColor(goal),
    }))
    .filter((item) => item.value && item.value > 0);

  const total = chartData.reduce((sum, item) => sum + (item.value || 0), 0);

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Goal Distribution</h3>
        <p className="text-sm text-muted-foreground">
          Breakdown of workout goals
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => {
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
              return `${name} ${percentage}%`;
            }}
            outerRadius={90}
            dataKey="value"
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
    </Card>
  );
}
