from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    WorkoutHistoryViewSet, 
    GeneratedWorkoutViewSet,
    WorkoutProgramViewSet,
    UserProgramEnrollmentViewSet,
)

router = DefaultRouter()
router.register(r'history', WorkoutHistoryViewSet, basename='workout-history')
router.register(r'generated', GeneratedWorkoutViewSet, basename='generated-workout')
router.register(r'programs', WorkoutProgramViewSet, basename='workout-program')
router.register(r'enrollments', UserProgramEnrollmentViewSet, basename='program-enrollment')

urlpatterns = [
    path('', include(router.urls)),
]
