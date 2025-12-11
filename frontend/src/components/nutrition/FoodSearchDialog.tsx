'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2 } from 'lucide-react';
import { nutritionAPI } from '@/lib/api-client';
import type { FoodItem } from '@/store/nutrition-store';

interface FoodSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (food: FoodItem) => void;
}

export default function FoodSearchDialog({ open, onOpenChange, onSelect }: FoodSearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadFoods();
    }
  }, [open]);

  const loadFoods = async (search?: string) => {
    setIsLoading(true);
    try {
      const data = await nutritionAPI.searchFoods(search);
      // Handle both paginated and direct array responses
      const foodsArray = Array.isArray(data) ? data : (data.results || []);
      setFoods(foodsArray);
    } catch (error) {
      console.error('Failed to load foods:', error);
      setFoods([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 1) {
      loadFoods(query);
    } else if (query.length === 0) {
      loadFoods();
    }
  };

  const handleSelectFood = (food: FoodItem) => {
    onSelect(food);
    onOpenChange(false);
    setSearchQuery('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Search Food Database</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for a food..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="overflow-y-auto max-h-[500px] space-y-2">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : Array.isArray(foods) && foods.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No foods found</p>
                <p className="text-sm mt-2">Try a different search term</p>
              </div>
            ) : Array.isArray(foods) ? (
              foods.map((food) => (
                <button
                  key={food.id}
                  onClick={() => handleSelectFood(food)}
                  className="w-full p-4 border rounded-lg hover:bg-accent transition-colors text-left"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{food.name}</h4>
                    <Badge variant="secondary">{food.serving_size}</Badge>
                  </div>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>{food.calories} cal</span>
                    <span>P: {food.protein}g</span>
                    <span>C: {food.carbs}g</span>
                    <span>F: {food.fat}g</span>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No foods found</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
