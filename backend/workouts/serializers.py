from rest_framework import serializers
from .models import WorkoutHistory, GeneratedWorkout


class WorkoutHistorySerializer(serializers.ModelSerializer):
    """Serializer for WorkoutHistory model"""
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = WorkoutHistory
        fields = [
            'id', 'user', 'user_username', 'workout_date', 'muscles_targeted',
            'duration', 'intensity', 'goal', 'equipment', 'exercises_completed',
            'points_earned', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'workout_date', 'points_earned', 'created_at']


class GeneratedWorkoutSerializer(serializers.ModelSerializer):
    """Serializer for GeneratedWorkout model"""
    class Meta:
        model = GeneratedWorkout
        fields = [
            'id', 'user', 'muscles_targeted', 'duration', 'intensity',
            'goal', 'equipment', 'workout_plan', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'created_at']


class WorkoutGenerationRequestSerializer(serializers.Serializer):
    """Serializer for workout generation request"""
    muscles_targeted = serializers.ListField(
        child=serializers.CharField(max_length=20),
        allow_empty=False
    )
    duration = serializers.IntegerField(min_value=1, max_value=180)
    intensity = serializers.ChoiceField(choices=['light', 'moderate', 'intense'])
    goal = serializers.ChoiceField(choices=['strength', 'hypertrophy', 'endurance'])
    equipment = serializers.ChoiceField(choices=['bodyweight', 'home', 'gym'])
