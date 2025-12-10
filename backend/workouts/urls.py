from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WorkoutHistoryViewSet, GeneratedWorkoutViewSet

router = DefaultRouter()
router.register(r'history', WorkoutHistoryViewSet, basename='workout-history')
router.register(r'generated', GeneratedWorkoutViewSet, basename='generated-workout')

urlpatterns = [
    path('', include(router.urls)),
]
