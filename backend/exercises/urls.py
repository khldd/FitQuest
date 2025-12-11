from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExerciseViewSet, WorkoutPresetViewSet

router = DefaultRouter()
router.register(r'presets', WorkoutPresetViewSet, basename='preset')
router.register(r'exercises', ExerciseViewSet, basename='exercise')

urlpatterns = [
    path('', include(router.urls)),
]
