'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useNutritionStore } from '@/store/nutrition-store';

export default function DailySummaryCard() {
  const { nutritionGoal, dailySummary } = useNutritionStore();

  if (!dailySummary) {
    return null;
  }

  const calculateProgress = (current: number, goal: number) => {
    return goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90 && percentage <= 110) return 'bg-green-500';
    if (percentage >= 70 && percentage < 90) return 'bg-yellow-500';
    if (percentage > 110) return 'bg-red-500';
    return 'bg-blue-500';
  };

  const macros = [
    {
      name: 'Calories',
      current: dailySummary.total_calories,
      goal: nutritionGoal?.daily_calories || 0,
      unit: '',
    },
    {
      name: 'Protein',
      current: Math.round(dailySummary.total_protein),
      goal: nutritionGoal?.daily_protein || 0,
      unit: 'g',
    },
    {
      name: 'Carbs',
      current: Math.round(dailySummary.total_carbs),
      goal: nutritionGoal?.daily_carbs || 0,
      unit: 'g',
    },
    {
      name: 'Fat',
      current: Math.round(dailySummary.total_fat),
      goal: nutritionGoal?.daily_fat || 0,
      unit: 'g',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Daily Summary</span>
          {nutritionGoal && (
            <Badge variant="outline" className="font-normal">
              {nutritionGoal.goal_type === 'cut' && 'Weight Loss'}
              {nutritionGoal.goal_type === 'maintain' && 'Maintain'}
              {nutritionGoal.goal_type === 'bulk' && 'Muscle Gain'}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {macros.map((macro) => {
          const progress = calculateProgress(macro.current, macro.goal);
          const progressColor = getProgressColor(progress);

          return (
            <div key={macro.name}>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">{macro.name}</span>
                <span className="text-sm text-muted-foreground">
                  {macro.current}{macro.unit}
                  {macro.goal > 0 && (
                    <span className="text-xs"> / {macro.goal}{macro.unit}</span>
                  )}
                </span>
              </div>
              <Progress
                value={progress}
                className="h-2"
                indicatorClassName={progressColor}
              />
              {macro.goal > 0 && (
                <div className="text-xs text-muted-foreground mt-1">
                  {Math.round(progress)}% of goal
                  {macro.goal - macro.current > 0 ? (
                    <span className="ml-2">
                      ({macro.goal - macro.current}{macro.unit} remaining)
                    </span>
                  ) : (
                    <span className="ml-2 text-orange-500">
                      (+{macro.current - macro.goal}{macro.unit} over)
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
