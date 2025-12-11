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
import { Badge } from '@/components/ui/badge';
import { nutritionAPI } from '@/lib/api-client';
import { useNutritionStore, type FoodItem, type MealLog } from '@/store/nutrition-store';
import { toast } from 'sonner';
import { Search, Star } from 'lucide-react';
import FoodSearchDialog from './FoodSearchDialog';

interface MealLogFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: string;
  defaultMealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  editingLog?: MealLog;
}

export default function MealLogForm({
  open,
  onOpenChange,
  defaultDate,
  defaultMealType,
  editingLog,
}: MealLogFormProps) {
  const { selectedDate, addMealLog, updateMealLog } = useNutritionStore();
  const [isLoading, setIsLoading] = useState(false);
  const [foodSearchOpen, setFoodSearchOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [showFavoriteOption, setShowFavoriteOption] = useState(false);
  const [favoriteName, setFavoriteName] = useState('');

  const [formData, setFormData] = useState({
    food_name: editingLog?.food_name || '',
    quantity: editingLog?.quantity || 1,
    calories: editingLog?.calories || 0,
    protein: editingLog?.protein || 0,
    carbs: editingLog?.carbs || 0,
    fat: editingLog?.fat || 0,
    meal_type: editingLog?.meal_type || defaultMealType || ('breakfast' as any),
    date: editingLog?.date || defaultDate || selectedDate,
    food_item: editingLog?.food_item,
  });

  const handleFoodSelect = (food: FoodItem) => {
    setSelectedFood(food);
    const quantity = formData.quantity || 1;
    setFormData({
      ...formData,
      food_name: food.name,
      calories: Math.round(food.calories * quantity),
      protein: food.protein * quantity,
      carbs: food.carbs * quantity,
      fat: food.fat * quantity,
      food_item: food.id,
    });
  };

  const handleQuantityChange = (quantity: number) => {
    if (!selectedFood) {
      setFormData({ ...formData, quantity });
      return;
    }

    setFormData({
      ...formData,
      quantity,
      calories: Math.round(selectedFood.calories * quantity),
      protein: selectedFood.protein * quantity,
      carbs: selectedFood.carbs * quantity,
      fat: selectedFood.fat * quantity,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Ensure proper data types for backend
      const payload = {
        ...formData,
        calories: Math.round(formData.calories), // Ensure integer
        protein: parseFloat(formData.protein.toString()),
        carbs: parseFloat(formData.carbs.toString()),
        fat: parseFloat(formData.fat.toString()),
        quantity: parseFloat(formData.quantity.toString()),
      };

      if (editingLog) {
        const updated = await nutritionAPI.updateMealLog(editingLog.id, payload);
        updateMealLog(editingLog.id, updated);
        toast.success('Meal updated successfully!');
      } else {
        const log = await nutritionAPI.createMealLog(payload);
        addMealLog(log);
        toast.success('Meal logged successfully!');

        // Add to favorites if requested
        if (showFavoriteOption && favoriteName && selectedFood) {
          try {
            await nutritionAPI.createFavoriteMeal({
              food_item: selectedFood.id,
              name: favoriteName,
              default_quantity: formData.quantity,
              default_meal_type: formData.meal_type,
            });
            toast.success('Added to favorites!');
          } catch (error) {
            console.error('Failed to add favorite:', error);
          }
        }
      }

      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Failed to log meal:', error);
      toast.error('Failed to log meal');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedFood(null);
    setShowFavoriteOption(false);
    setFavoriteName('');
    setFormData({
      food_name: '',
      quantity: 1,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      meal_type: defaultMealType || 'breakfast',
      date: defaultDate || selectedDate,
      food_item: undefined,
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingLog ? 'Edit Meal' : 'Log a Meal'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Food Selection */}
            <div>
              <Label>Food Item</Label>
              {selectedFood ? (
                <div className="p-3 border rounded-lg bg-muted">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{selectedFood.name}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFoodSearchOpen(true)}
                    >
                      Change
                    </Button>
                  </div>
                  <div className="flex gap-3 text-sm text-muted-foreground">
                    <span>Per {selectedFood.serving_size}</span>
                    <span>{selectedFood.calories} cal</span>
                    <span>P: {selectedFood.protein}g</span>
                    <span>C: {selectedFood.carbs}g</span>
                    <span>F: {selectedFood.fat}g</span>
                  </div>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setFoodSearchOpen(true)}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search Food Database
                </Button>
              )}
            </div>

            {/* Manual Entry Option */}
            {!selectedFood && (
              <div>
                <Label htmlFor="food_name">Or Enter Manually</Label>
                <Input
                  id="food_name"
                  value={formData.food_name}
                  onChange={(e) => setFormData({ ...formData, food_name: e.target.value })}
                  placeholder="e.g., Homemade Pizza"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="meal_type">Meal Type</Label>
                <Select
                  value={formData.meal_type}
                  onValueChange={(value: any) => setFormData({ ...formData, meal_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">Breakfast</SelectItem>
                    <SelectItem value="lunch">Lunch</SelectItem>
                    <SelectItem value="dinner">Dinner</SelectItem>
                    <SelectItem value="snack">Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="quantity">Servings</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.5"
                  min="0.5"
                  value={formData.quantity}
                  onChange={(e) => handleQuantityChange(parseFloat(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="calories">Calories</Label>
                <Input
                  id="calories"
                  type="number"
                  value={formData.calories}
                  onChange={(e) => setFormData({ ...formData, calories: parseInt(e.target.value) })}
                  required
                  disabled={!!selectedFood}
                />
              </div>

              <div>
                <Label htmlFor="protein">Protein (g)</Label>
                <Input
                  id="protein"
                  type="number"
                  step="0.1"
                  value={formData.protein}
                  onChange={(e) => setFormData({ ...formData, protein: parseFloat(e.target.value) })}
                  required
                  disabled={!!selectedFood}
                />
              </div>

              <div>
                <Label htmlFor="carbs">Carbs (g)</Label>
                <Input
                  id="carbs"
                  type="number"
                  step="0.1"
                  value={formData.carbs}
                  onChange={(e) => setFormData({ ...formData, carbs: parseFloat(e.target.value) })}
                  required
                  disabled={!!selectedFood}
                />
              </div>

              <div>
                <Label htmlFor="fat">Fat (g)</Label>
                <Input
                  id="fat"
                  type="number"
                  step="0.1"
                  value={formData.fat}
                  onChange={(e) => setFormData({ ...formData, fat: parseFloat(e.target.value) })}
                  required
                  disabled={!!selectedFood}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            {/* Add to Favorites */}
            {!editingLog && selectedFood && (
              <div className="pt-2 border-t">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showFavoriteOption}
                    onChange={(e) => setShowFavoriteOption(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <Star className="w-4 h-4" />
                  <span className="text-sm">Add to favorites</span>
                </label>

                {showFavoriteOption && (
                  <Input
                    placeholder="Favorite name (e.g., 'My Breakfast')"
                    value={favoriteName}
                    onChange={(e) => setFavoriteName(e.target.value)}
                    className="mt-2"
                  />
                )}
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1" disabled={isLoading || !formData.food_name}>
                {isLoading ? 'Saving...' : editingLog ? 'Update' : 'Log Meal'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <FoodSearchDialog
        open={foodSearchOpen}
        onOpenChange={setFoodSearchOpen}
        onSelect={handleFoodSelect}
      />
    </>
  );
}
