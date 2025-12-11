'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { nutritionAPI } from '@/lib/api-client';
import { useNutritionStore } from '@/store/nutrition-store';
import { Plus, Calendar, Target, Apple, Loader2 } from 'lucide-react';
import DailySummaryCard from '@/components/nutrition/DailySummaryCard';
import MealsList from '@/components/nutrition/MealsList';
import QuickAddFavorites from '@/components/nutrition/QuickAddFavorites';
import MealLogForm from '@/components/nutrition/MealLogForm';
import NutritionGoalForm from '@/components/nutrition/NutritionGoalForm';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

export default function NutritionPage() {
  const {
    selectedDate,
    setSelectedDate,
    nutritionGoal,
    setNutritionGoal,
    mealLogs,
    setMealLogs,
    dailySummary,
    setDailySummary,
    isLoading,
    setIsLoading,
  } = useNutritionStore();

  const [mealFormOpen, setMealFormOpen] = useState(false);
  const [goalFormOpen, setGoalFormOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [goalData, summaryData, logsData] = await Promise.all([
        nutritionAPI.getGoal(),
        nutritionAPI.getDailySummary(selectedDate),
        nutritionAPI.getMealLogs({ date: selectedDate }),
      ]);

      setNutritionGoal(goalData?.id ? goalData : null);
      setDailySummary(summaryData);
      
      // Handle paginated response
      const meals = Array.isArray(logsData) ? logsData : (logsData?.results || []);
      setMealLogs(meals);
    } catch (error) {
      console.error('Failed to load nutrition data:', error);
      toast.error('Failed to load nutrition data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!nutritionGoal) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <Target className="h-20 w-20 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-3xl font-bold mb-3">Set Your Nutrition Goals</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start tracking your nutrition by setting daily calorie and macro targets based on your fitness goals
            </p>
            <Button size="lg" onClick={() => setGoalFormOpen(true)}>
              <Plus className="mr-2 h-5 w-5" />
              Create Nutrition Goals
            </Button>
          </CardContent>
        </Card>

        <NutritionGoalForm open={goalFormOpen} onOpenChange={setGoalFormOpen} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Nutrition Tracking</h1>
          <p className="text-muted-foreground">Monitor your daily nutrition and reach your goals</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setGoalFormOpen(true)}>
            <Target className="w-4 h-4 mr-2" />
            Edit Goals
          </Button>
          <Button onClick={() => setMealFormOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Log Meal
          </Button>
        </div>
      </div>

      {/* Date Selector */}
      <div className="flex items-center gap-4">
        <Calendar className="w-5 h-5 text-muted-foreground" />
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-auto"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
        >
          Today
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Summary and Meals */}
        <div className="lg:col-span-2 space-y-6">
          <DailySummaryCard />
          <MealsList meals={mealLogs} />
        </div>

        {/* Right Column - Quick Actions */}
        <div className="space-y-6">
          <QuickAddFavorites />
        </div>
      </div>

      <MealLogForm
        open={mealFormOpen}
        onOpenChange={setMealFormOpen}
        defaultDate={selectedDate}
      />

      <NutritionGoalForm open={goalFormOpen} onOpenChange={setGoalFormOpen} />
    </div>
  );
}
