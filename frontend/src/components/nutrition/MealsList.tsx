'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Loader2 } from 'lucide-react';
import { nutritionAPI } from '@/lib/api-client';
import { useNutritionStore, type MealLog } from '@/store/nutrition-store';
import { toast } from 'sonner';
import MealLogForm from './MealLogForm';

interface MealsListProps {
  meals: MealLog[];
}

const mealTypeColors = {
  breakfast: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  lunch: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  dinner: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  snack: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
};

export default function MealsList({ meals }: MealsListProps) {
  const { removeMealLog } = useNutritionStore();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [editingLog, setEditingLog] = useState<MealLog | null>(null);

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await nutritionAPI.deleteMealLog(id);
      removeMealLog(id);
      toast.success('Meal deleted successfully');
    } catch (error) {
      console.error('Failed to delete meal:', error);
      toast.error('Failed to delete meal');
    } finally {
      setDeletingId(null);
    }
  };

  const mealsArray = Array.isArray(meals) ? meals : [];
  
  const groupedMeals = mealsArray.reduce((acc, meal) => {
    if (!acc[meal.meal_type]) {
      acc[meal.meal_type] = [];
    }
    acc[meal.meal_type].push(meal);
    return acc;
  }, {} as Record<string, MealLog[]>);

  if (mealsArray.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <p>No meals logged for this day</p>
          <p className="text-sm mt-2">Click "Log Meal" to add your first meal</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((mealType) => {
          const mealsForType = groupedMeals[mealType] || [];
          if (mealsForType.length === 0) return null;

          const totalForType = mealsForType.reduce(
            (acc, meal) => ({
              calories: acc.calories + meal.calories,
              protein: acc.protein + meal.protein,
              carbs: acc.carbs + meal.carbs,
              fat: acc.fat + meal.fat,
            }),
            { calories: 0, protein: 0, carbs: 0, fat: 0 }
          );

          return (
            <Card key={mealType}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <Badge className={mealTypeColors[mealType]}>
                    {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    {totalForType.calories} cal
                  </div>
                </div>

                <div className="space-y-2">
                  {mealsForType.map((meal) => (
                    <div
                      key={meal.id}
                      className="flex justify-between items-start p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium">
                          {meal.food_name}
                          {meal.quantity !== 1 && (
                            <span className="text-sm text-muted-foreground ml-2">
                              × {meal.quantity}
                            </span>
                          )}
                        </h4>
                        <div className="flex gap-3 text-sm text-muted-foreground mt-1">
                          <span>{meal.calories} cal</span>
                          <span>P: {meal.protein.toFixed(1)}g</span>
                          <span>C: {meal.carbs.toFixed(1)}g</span>
                          <span>F: {meal.fat.toFixed(1)}g</span>
                        </div>
                      </div>

                      <div className="flex gap-1 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingLog(meal)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(meal.id)}
                          disabled={deletingId === meal.id}
                        >
                          {deletingId === meal.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {editingLog && (
        <MealLogForm
          open={!!editingLog}
          onOpenChange={(open) => !open && setEditingLog(null)}
          editingLog={editingLog}
        />
      )}
    </>
  );
}
