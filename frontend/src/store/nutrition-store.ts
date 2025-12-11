import { create } from 'zustand';

export interface FoodItem {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving_size: string;
}

export interface NutritionGoal {
  id: number;
  daily_calories: number;
  daily_protein: number;
  daily_carbs: number;
  daily_fat: number;
  goal_type: 'maintain' | 'cut' | 'bulk';
  updated_at: string;
}

export interface MealLog {
  id: number;
  food_item?: number;
  food_name: string;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  date: string;
  created_at: string;
}

export interface FavoriteMeal {
  id: number;
  food_item: number;
  food_item_details: FoodItem;
  name: string;
  default_quantity: number;
  default_meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  created_at: string;
}

export interface DailySummary {
  date: string;
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
}

interface NutritionStore {
  selectedDate: string;
  nutritionGoal: NutritionGoal | null;
  mealLogs: MealLog[];
  favoriteMeals: FavoriteMeal[];
  dailySummary: DailySummary | null;
  isLoading: boolean;
  
  setSelectedDate: (date: string) => void;
  setNutritionGoal: (goal: NutritionGoal | null) => void;
  setMealLogs: (logs: MealLog[]) => void;
  setFavoriteMeals: (favorites: FavoriteMeal[]) => void;
  setDailySummary: (summary: DailySummary | null) => void;
  setIsLoading: (loading: boolean) => void;
  
  addMealLog: (log: MealLog) => void;
  removeMealLog: (logId: number) => void;
  updateMealLog: (logId: number, log: MealLog) => void;
  
  addFavoriteMeal: (favorite: FavoriteMeal) => void;
  removeFavoriteMeal: (favoriteId: number) => void;
  
  reset: () => void;
}

const getTodayString = () => {
  return new Date().toISOString().split('T')[0];
};

export const useNutritionStore = create<NutritionStore>((set) => ({
  selectedDate: getTodayString(),
  nutritionGoal: null,
  mealLogs: [],
  favoriteMeals: [],
  dailySummary: null,
  isLoading: false,
  
  setSelectedDate: (date) => set({ selectedDate: date }),
  setNutritionGoal: (goal) => set({ nutritionGoal: goal }),
  setMealLogs: (logs) => set({ mealLogs: logs }),
  setFavoriteMeals: (favorites) => set({ favoriteMeals: favorites }),
  setDailySummary: (summary) => set({ dailySummary: summary }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  addMealLog: (log) => set((state) => ({ 
    mealLogs: [log, ...state.mealLogs] 
  })),
  
  removeMealLog: (logId) => set((state) => ({ 
    mealLogs: state.mealLogs.filter(log => log.id !== logId) 
  })),
  
  updateMealLog: (logId, updatedLog) => set((state) => ({ 
    mealLogs: state.mealLogs.map(log => 
      log.id === logId ? updatedLog : log
    ) 
  })),
  
  addFavoriteMeal: (favorite) => set((state) => ({ 
    favoriteMeals: [favorite, ...state.favoriteMeals] 
  })),
  
  removeFavoriteMeal: (favoriteId) => set((state) => ({ 
    favoriteMeals: state.favoriteMeals.filter(fav => fav.id !== favoriteId) 
  })),
  
  reset: () => set({
    selectedDate: getTodayString(),
    nutritionGoal: null,
    mealLogs: [],
    favoriteMeals: [],
    dailySummary: null,
    isLoading: false,
  }),
}));
