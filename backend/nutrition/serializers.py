from rest_framework import serializers
from .models import FoodItem, NutritionGoal, MealLog, FavoriteMeal

class FoodItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodItem
        fields = '__all__'

class NutritionGoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = NutritionGoal
        fields = ['id', 'daily_calories', 'daily_protein', 'daily_carbs', 'daily_fat', 'goal_type', 'updated_at']
        read_only_fields = ['id', 'updated_at']

    def create(self, validated_data):
        user = self.context['request'].user
        goal, created = NutritionGoal.objects.update_or_create(
            user=user,
            defaults=validated_data
        )
        return goal

class MealLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = MealLog
        fields = ['id', 'food_item', 'food_name', 'quantity', 'calories', 'protein', 'carbs', 'fat', 'meal_type', 'date', 'created_at']
        read_only_fields = ['id', 'created_at']


class FavoriteMealSerializer(serializers.ModelSerializer):
    food_item_details = FoodItemSerializer(source='food_item', read_only=True)
    
    class Meta:
        model = FavoriteMeal
        fields = ['id', 'food_item', 'food_item_details', 'name', 'default_quantity', 'default_meal_type', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def create(self, validated_data):
        user = self.context['request'].user
        return FavoriteMeal.objects.create(user=user, **validated_data)
