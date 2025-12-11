from django.db import models
from django.contrib.auth.models import User

class FoodItem(models.Model):
    name = models.CharField(max_length=100)
    calories = models.IntegerField()
    protein = models.FloatField(help_text="Protein in grams")
    carbs = models.FloatField(help_text="Carbohydrates in grams")
    fat = models.FloatField(help_text="Fat in grams")
    serving_size = models.CharField(max_length=50, help_text="e.g., '100g' or '1 cup'")
    
    def __str__(self):
        return self.name

class NutritionGoal(models.Model):
    GOAL_TYPES = [
        ('maintain', 'Maintain Weight'),
        ('cut', 'Weight Loss'),
        ('bulk', 'Muscle Gain'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='nutrition_goal')
    daily_calories = models.IntegerField()
    daily_protein = models.IntegerField(help_text="Target protein in grams")
    daily_carbs = models.IntegerField(help_text="Target carbs in grams")
    daily_fat = models.IntegerField(help_text="Target fat in grams")
    goal_type = models.CharField(max_length=20, choices=GOAL_TYPES, default='maintain')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username}'s Nutrition Goal"

class MealLog(models.Model):
    MEAL_TYPES = [
        ('breakfast', 'Breakfast'),
        ('lunch', 'Lunch'),
        ('dinner', 'Dinner'),
        ('snack', 'Snack'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='meal_logs')
    food_item = models.ForeignKey(FoodItem, on_delete=models.SET_NULL, null=True, blank=True)
    food_name = models.CharField(max_length=100) # In case food_item is deleted or custom entry
    quantity = models.FloatField(default=1.0, help_text="Number of servings (e.g., 1.5 for 1.5 servings)")
    calories = models.IntegerField()
    protein = models.FloatField()
    carbs = models.FloatField()
    fat = models.FloatField()
    meal_type = models.CharField(max_length=20, choices=MEAL_TYPES)
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.food_name} ({self.meal_type}) - {self.date}"


class FavoriteMeal(models.Model):
    """Store user's favorite meals for quick logging"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorite_meals')
    food_item = models.ForeignKey(FoodItem, on_delete=models.CASCADE)
    name = models.CharField(max_length=100, help_text="Custom name for this favorite")
    default_quantity = models.FloatField(default=1.0, help_text="Default serving size")
    default_meal_type = models.CharField(max_length=20, choices=MealLog.MEAL_TYPES, default='snack')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        unique_together = ['user', 'food_item', 'name']
    
    def __str__(self):
        return f"{self.user.username}'s favorite: {self.name}"
