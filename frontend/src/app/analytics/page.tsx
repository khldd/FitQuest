'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useAnalyticsStore } from '@/store/analytics-store';
import { analyticsAPI } from '@/lib/api-client';
import { AnalyticsHeader } from '@/components/analytics/AnalyticsHeader';
import { MetricsGrid } from '@/components/analytics/MetricsGrid';
import { WorkoutFrequencyChart } from '@/components/analytics/WorkoutFrequencyChart';
import { IntensityDistributionChart } from '@/components/analytics/IntensityDistributionChart';
import { MuscleDistributionChart } from '@/components/analytics/MuscleDistributionChart';
import { GoalBreakdownChart } from '@/components/analytics/GoalBreakdownChart';
import { DayOfWeekChart } from '@/components/analytics/DayOfWeekChart';
import { ConsistencyHeatmap } from '@/components/analytics/ConsistencyHeatmap';
import { PersonalRecordsCard } from '@/components/analytics/PersonalRecordsCard';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { AlertCircle, Dumbbell } from 'lucide-react';

export default function AnalyticsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const {
    summary,
    trends,
    muscles,
    consistency,
    records,
    selectedPeriod,
    isLoading,
    error,
    setSummary,
    setTrends,
    setMuscles,
    setConsistency,
    setRecords,
    setLoading,
    setError,
    clearError,
  } = useAnalyticsStore();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // Fetch analytics data
  const fetchAnalytics = async () => {
    setLoading(true);
    clearError();

    try {
      const params = { period: selectedPeriod };

      // Fetch all analytics data in parallel
      const [summaryData, trendsData, musclesData, consistencyData, recordsData] =
        await Promise.all([
          analyticsAPI.getSummary(params),
          analyticsAPI.getTrends(params),
          analyticsAPI.getMuscles(params),
          analyticsAPI.getConsistency(params),
          analyticsAPI.getRecords(),
        ]);

      setSummary(summaryData);
      setTrends(trendsData);
      setMuscles(musclesData);
      setConsistency(consistencyData);
      setRecords(recordsData);
    } catch (err: any) {
      console.error('Failed to fetch analytics:', err);
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on mount and when period changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchAnalytics();
    }
  }, [selectedPeriod, isAuthenticated]);

  // Loading state
  if (isLoading && !summary) {
    return (
      <div className="container mx-auto max-w-7xl space-y-6 p-4 py-8">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-[400px]" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-[350px]" />
          <Skeleton className="h-[350px]" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto max-w-7xl p-4 py-8">
        <Card className="p-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div>
              <h2 className="text-xl font-semibold">Failed to Load Analytics</h2>
              <p className="mt-2 text-muted-foreground">{error}</p>
            </div>
            <Button onClick={fetchAnalytics}>Retry</Button>
          </div>
        </Card>
      </div>
    );
  }

  // Empty state (no workouts)
  if (summary && summary.metrics.total_workouts === 0) {
    return (
      <div className="container mx-auto max-w-7xl space-y-6 p-4 py-8">
        <AnalyticsHeader />
        <Card className="p-12">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="rounded-full bg-primary/10 p-6">
              <Dumbbell className="h-12 w-12 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">No Workout Data Yet</h2>
              <p className="mt-2 text-muted-foreground">
                Start tracking your workouts to see analytics and insights
              </p>
            </div>
            <Button onClick={() => router.push('/generator/muscle-selection')}>
              Generate Your First Workout
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Main analytics view
  return (
    <div className="container mx-auto max-w-7xl space-y-6 p-4 py-8">
      <AnalyticsHeader />

      {/* Metrics Grid */}
      {summary && <MetricsGrid metrics={summary.metrics} />}

      {/* Workout Frequency Chart */}
      {trends && trends.data.length > 0 && (
        <WorkoutFrequencyChart data={trends} />
      )}

      {/* Two Column Layout */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Intensity Distribution */}
        {summary && (
          <IntensityDistributionChart data={summary.intensity_breakdown} />
        )}

        {/* Goal Breakdown */}
        {summary && Object.keys(summary.goal_breakdown).length > 0 && (
          <GoalBreakdownChart data={summary.goal_breakdown} />
        )}
      </div>

      {/* Muscle Distribution - Full Width */}
      {muscles && muscles.muscle_frequency.length > 0 && (
        <MuscleDistributionChart data={muscles} />
      )}

      {/* Two Column Layout */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Day of Week */}
        {consistency && (
          <DayOfWeekChart data={consistency.day_of_week_breakdown} />
        )}

        {/* Consistency Stats Card */}
        {consistency && (
          <Card className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold">Weekly Consistency</h3>
              <p className="text-sm text-muted-foreground">
                Your workout consistency metrics
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Avg Workouts/Week
                </span>
                <span className="text-2xl font-bold">
                  {consistency.weekly_consistency.actual_avg_per_week}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Achievement Rate
                </span>
                <span className="text-2xl font-bold">
                  {consistency.weekly_consistency.achievement_rate}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Current Streak
                </span>
                <span className="text-2xl font-bold">
                  {consistency.current_streak} days
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Longest Streak
                </span>
                <span className="text-2xl font-bold">
                  {consistency.longest_streak} days
                </span>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Consistency Heatmap */}
      {consistency && consistency.workout_calendar.length > 0 && (
        <ConsistencyHeatmap data={consistency.workout_calendar} />
      )}

      {/* Personal Records */}
      {records && <PersonalRecordsCard data={records} />}
    </div>
  );
}
