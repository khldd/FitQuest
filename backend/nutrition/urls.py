from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FoodItemViewSet, NutritionGoalViewSet, MealLogViewSet, FavoriteMealViewSet

router = DefaultRouter()
router.register(r'foods', FoodItemViewSet)
router.register(r'goals', NutritionGoalViewSet, basename='nutrition-goal')
router.register(r'logs', MealLogViewSet, basename='meal-log')
router.register(r'favorites', FavoriteMealViewSet, basename='favorite-meal')

urlpatterns = [
    path('', include(router.urls)),
]
