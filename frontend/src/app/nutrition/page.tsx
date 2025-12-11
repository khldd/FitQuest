'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { nutritionAPI } from '@/lib/api-client';
import { DailySummary, NutritionGoal, MealLog } from '@/types/nutrition';
import { Apple, Flame, TrendingUp, Plus } from 'lucide-react';

export default function NutritionPage() {
  const [goal, setGoal] = useState<NutritionGoal | null>(null);
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [goalData, summaryData, mealsData] = await Promise.all([
          nutritionAPI.getGoal(),
          nutritionAPI.getDailySummary(today),
          nutritionAPI.getMealLogs({ date: today }),
        ]);

        setGoal(goalData);
        setSummary(summaryData);
        setMeals(mealsData.results || []);
      } catch (error) {
        console.error('Failed to fetch nutrition data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [today]);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!goal || !goal.id) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-8 text-center">
          <Apple className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Set Your Nutrition Goals</h2>
          <p className="text-muted-foreground mb-6">
            Start tracking your nutrition by setting up your daily goals
          </p>
          <Button size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Create Nutrition Goals
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            Feature coming soon! Use Django admin to set goals for now.
          </p>
        </Card>
      </div>
    );
  }

  const macros = [
    {
      name: 'Calories',
      current: summary?.total_calories || 0,
      target: goal.daily_calories,
      unit: 'kcal',
      icon: Flame,
      color: 'text-orange-500',
    },
    {
      name: 'Protein',
      current: summary?.total_protein || 0,
      target: goal.daily_protein,
      unit: 'g',
      icon: TrendingUp,
      color: 'text-blue-500',
    },
    {
      name: 'Carbs',
      current: summary?.total_carbs || 0,
      target: goal.daily_carbs,
      unit: 'g',
      icon: Apple,
      color: 'text-green-500',
    },
    {
      name: 'Fat',
      current: summary?.total_fat || 0,
      target: goal.daily_fat,
      unit: 'g',
      icon: Apple,
      color: 'text-yellow-500',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Nutrition Dashboard</h1>
          <p className="text-muted-foreground">Track your daily nutrition</p>
        </div>
        <Badge variant="outline" className="capitalize">
          {goal.goal_type.replace('_', ' ')}
        </Badge>
      </div>

      {/* Macro Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {macros.map((macro) => {
          const percentage = Math.min((macro.current / macro.target) * 100, 100);
          const Icon = macro.icon;

          return (
            <Card key={macro.name} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-full bg-muted ${macro.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-2xl font-bold">
                  {Math.round(macro.current)}
                  <span className="text-sm text-muted-foreground">/{macro.target}</span>
                </span>
              </div>
              <h3 className="font-semibold mb-2">{macro.name}</h3>
              <Progress value={percentage} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {Math.round(percentage)}% of daily goal
              </p>
            </Card>
          );
        })}
      </div>

      {/* Meals Today */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Today's Meals</h2>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Log Meal
          </Button>
        </div>

        {meals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Apple className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No meals logged today</p>
            <p className="text-sm">Use Django admin to log meals for now</p>
          </div>
        ) : (
          <div className="space-y-3">
            {meals.map((meal) => (
              <div
                key={meal.id}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="capitalize">
                      {meal.meal_type}
                    </Badge>
                    <h3 className="font-semibold">{meal.food_name}</h3>
                  </div>
                  <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                    <span>{meal.calories} kcal</span>
                    <span>•</span>
                    <span>P: {meal.protein}g</span>
                    <span>•</span>
                    <span>C: {meal.carbs}g</span>
                    <span>•</span>
                    <span>F: {meal.fat}g</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Info Box */}
      <Card className="p-6 bg-primary/5 border-primary/20">
        <h3 className="font-semibold mb-2">🚧 Feature In Development</h3>
        <p className="text-sm text-muted-foreground">
          Full meal logging UI coming soon! For now, you can set nutrition goals and log meals through the Django admin panel at <code className="bg-muted px-2 py-1 rounded">/admin/nutrition/</code>
        </p>
      </Card>
    </div>
  );
}
