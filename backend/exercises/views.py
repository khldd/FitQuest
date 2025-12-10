from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Exercise, WorkoutPreset
from .serializers import ExerciseSerializer, WorkoutPresetSerializer


class ExerciseViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Exercise model (read-only)"""
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['primary_muscle', 'equipment', 'difficulty']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'primary_muscle', 'difficulty']
    ordering = ['primary_muscle', 'name']


class WorkoutPresetViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for WorkoutPreset model (read-only)"""
    queryset = WorkoutPreset.objects.all()
    serializer_class = WorkoutPresetSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'recommended_level']
    ordering = ['name']
