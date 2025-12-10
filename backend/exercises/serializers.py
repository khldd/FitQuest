from rest_framework import serializers
from .models import Exercise, WorkoutPreset


class ExerciseSerializer(serializers.ModelSerializer):
    """Serializer for Exercise model"""
    class Meta:
        model = Exercise
        fields = [
            'id', 'name', 'primary_muscle', 'secondary_muscles', 'equipment',
            'difficulty', 'sets_min', 'sets_max', 'reps_min', 'reps_max',
            'rest_seconds', 'description', 'instructions', 'tips',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class WorkoutPresetSerializer(serializers.ModelSerializer):
    """Serializer for WorkoutPreset model"""
    class Meta:
        model = WorkoutPreset
        fields = ['id', 'name', 'description', 'muscle_groups', 'recommended_level', 'created_at']
        read_only_fields = ['id', 'created_at']
