from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExerciseViewSet, WorkoutPresetViewSet

router = DefaultRouter()
router.register(r'', ExerciseViewSet, basename='exercise')
router.register(r'presets', WorkoutPresetViewSet, basename='preset')

urlpatterns = [
    path('', include(router.urls)),
]
