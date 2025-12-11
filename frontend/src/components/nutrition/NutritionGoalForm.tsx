'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { nutritionAPI } from '@/lib/api-client';
import { useNutritionStore } from '@/store/nutrition-store';
import { toast } from 'sonner';

interface NutritionGoalFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NutritionGoalForm({ open, onOpenChange }: NutritionGoalFormProps) {
  const { nutritionGoal, setNutritionGoal } = useNutritionStore();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    daily_calories: nutritionGoal?.daily_calories || 2000,
    daily_protein: nutritionGoal?.daily_protein || 150,
    daily_carbs: nutritionGoal?.daily_carbs || 200,
    daily_fat: nutritionGoal?.daily_fat || 65,
    goal_type: nutritionGoal?.goal_type || 'maintain' as 'maintain' | 'cut' | 'bulk',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const goal = await nutritionAPI.createGoal(formData);
      setNutritionGoal(goal);
      toast.success('Nutrition goal saved successfully!');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save nutrition goal:', error);
      toast.error('Failed to save nutrition goal');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreset = (preset: 'cut' | 'maintain' | 'bulk') => {
    const presets = {
      cut: { calories: 1800, protein: 180, carbs: 150, fat: 50 },
      maintain: { calories: 2200, protein: 165, carbs: 220, fat: 70 },
      bulk: { calories: 2800, protein: 200, carbs: 300, fat: 90 },
    };

    const selected = presets[preset];
    setFormData({
      ...formData,
      goal_type: preset,
      daily_calories: selected.calories,
      daily_protein: selected.protein,
      daily_carbs: selected.carbs,
      daily_fat: selected.fat,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Set Your Nutrition Goals</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Goal Type</Label>
            <Select
              value={formData.goal_type}
              onValueChange={(value: any) => {
                setFormData({ ...formData, goal_type: value });
                handlePreset(value);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cut">Weight Loss (Cut)</SelectItem>
                <SelectItem value="maintain">Maintain Weight</SelectItem>
                <SelectItem value="bulk">Muscle Gain (Bulk)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="calories">Daily Calories</Label>
              <Input
                id="calories"
                type="number"
                value={formData.daily_calories}
                onChange={(e) =>
                  setFormData({ ...formData, daily_calories: parseInt(e.target.value) })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="protein">Protein (g)</Label>
              <Input
                id="protein"
                type="number"
                value={formData.daily_protein}
                onChange={(e) =>
                  setFormData({ ...formData, daily_protein: parseInt(e.target.value) })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="carbs">Carbs (g)</Label>
              <Input
                id="carbs"
                type="number"
                value={formData.daily_carbs}
                onChange={(e) =>
                  setFormData({ ...formData, daily_carbs: parseInt(e.target.value) })
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="fat">Fat (g)</Label>
              <Input
                id="fat"
                type="number"
                value={formData.daily_fat}
                onChange={(e) =>
                  setFormData({ ...formData, daily_fat: parseInt(e.target.value) })
                }
                required
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Goal'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
