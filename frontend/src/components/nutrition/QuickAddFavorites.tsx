'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Plus, Trash2, Loader2 } from 'lucide-react';
import { nutritionAPI } from '@/lib/api-client';
import { useNutritionStore, type FavoriteMeal } from '@/store/nutrition-store';
import { toast } from 'sonner';

export default function QuickAddFavorites() {
  const { favoriteMeals, setFavoriteMeals, removeFavoriteMeal, addMealLog, selectedDate } =
    useNutritionStore();
  const [isLoading, setIsLoading] = useState(false);
  const [loggingId, setLoggingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setIsLoading(true);
    try {
      const data = await nutritionAPI.getFavoriteMeals();
      setFavoriteMeals(data);
    } catch (error) {
      console.error('Failed to load favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLog = async (favorite: FavoriteMeal) => {
    setLoggingId(favorite.id);
    try {
      const log = await nutritionAPI.logFavoriteNow(favorite.id, {
        date: selectedDate,
      });
      addMealLog(log);
      toast.success(`${favorite.name} logged successfully!`);
    } catch (error) {
      console.error('Failed to log favorite:', error);
      toast.error('Failed to log meal');
    } finally {
      setLoggingId(null);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await nutritionAPI.deleteFavoriteMeal(id);
      removeFavoriteMeal(id);
      toast.success('Favorite removed');
    } catch (error) {
      console.error('Failed to delete favorite:', error);
      toast.error('Failed to remove favorite');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const favoritesArray = Array.isArray(favoriteMeals) ? favoriteMeals : [];

  if (favoritesArray.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Quick Add Favorites
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          <p>No favorite meals yet</p>
          <p className="text-sm mt-2">
            When logging a meal, check "Add to favorites" to save it here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
          Quick Add Favorites
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {favoritesArray.map((favorite) => (
          <div
            key={favorite.id}
            className="flex justify-between items-center p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="flex-1">
              <h4 className="font-medium">{favorite.name}</h4>
              <div className="flex gap-3 text-sm text-muted-foreground mt-1">
                <Badge variant="outline" className="text-xs">
                  {favorite.default_meal_type}
                </Badge>
                <span>
                  {Math.round(
                    favorite.food_item_details.calories * favorite.default_quantity
                  )}{' '}
                  cal
                </span>
                <span>× {favorite.default_quantity}</span>
              </div>
            </div>

            <div className="flex gap-1 ml-4">
              <Button
                size="sm"
                onClick={() => handleQuickLog(favorite)}
                disabled={loggingId === favorite.id}
              >
                {loggingId === favorite.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-1" />
                    Log
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(favorite.id)}
                disabled={deletingId === favorite.id}
              >
                {deletingId === favorite.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
