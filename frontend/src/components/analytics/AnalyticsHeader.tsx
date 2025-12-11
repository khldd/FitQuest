'use client';

import { Button } from '@/components/ui/button';
import { useAnalyticsStore } from '@/store/analytics-store';
import { BarChart3, Download } from 'lucide-react';

export function AnalyticsHeader() {
  const { selectedPeriod, setPeriod } = useAnalyticsStore();

  const periods = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: 'all', label: 'All Time' },
  ] as const;

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2">
          <BarChart3 className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Workout Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Track your progress and insights
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {periods.map((period) => (
          <Button
            key={period.value}
            variant={selectedPeriod === period.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod(period.value)}
          >
            {period.label}
          </Button>
        ))}
        <Button variant="outline" size="sm" disabled>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>
    </div>
  );
}
