from django.contrib import admin
from .models import FoodItem, NutritionGoal, MealLog, FavoriteMeal


@admin.register(FoodItem)
class FoodItemAdmin(admin.ModelAdmin):
    list_display = ['name', 'calories', 'protein', 'carbs', 'fat', 'serving_size']
    search_fields = ['name']


@admin.register(NutritionGoal)
class NutritionGoalAdmin(admin.ModelAdmin):
    list_display = ['user', 'goal_type', 'daily_calories', 'daily_protein', 'daily_carbs', 'daily_fat']
    list_filter = ['goal_type']
    search_fields = ['user__username']


@admin.register(MealLog)
class MealLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'food_name', 'quantity', 'meal_type', 'date', 'calories', 'protein']
    list_filter = ['meal_type', 'date']
    search_fields = ['user__username', 'food_name']
    date_hierarchy = 'date'


@admin.register(FavoriteMeal)
class FavoriteMealAdmin(admin.ModelAdmin):
    list_display = ['user', 'name', 'food_item', 'default_quantity', 'default_meal_type']
    list_filter = ['default_meal_type']
    search_fields = ['user__username', 'name', 'food_item__name']
