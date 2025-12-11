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


# Analytics Serializers

class AnalyticsSummarySerializer(serializers.Serializer):
    """Serializer for analytics summary response"""
    period = serializers.DictField(child=serializers.CharField())
    metrics = serializers.DictField()
    intensity_breakdown = serializers.DictField()
    goal_breakdown = serializers.DictField()
    equipment_breakdown = serializers.DictField()


class TrendsDataPointSerializer(serializers.Serializer):
    """Serializer for individual trend data point"""
    date = serializers.DateField()
    workouts = serializers.IntegerField()
    duration = serializers.IntegerField()
    points = serializers.IntegerField()
    avg_intensity = serializers.FloatField()


class TrendsDataSerializer(serializers.Serializer):
    """Serializer for trends data response"""
    granularity = serializers.CharField()
    data = TrendsDataPointSerializer(many=True)


class MuscleFrequencySerializer(serializers.Serializer):
    """Serializer for muscle frequency data"""
    muscle = serializers.CharField()
    count = serializers.IntegerField()
    total_duration = serializers.IntegerField()
    percentage = serializers.FloatField()


class MuscleAnalyticsSerializer(serializers.Serializer):
    """Serializer for muscle analytics response"""
    muscle_frequency = MuscleFrequencySerializer(many=True)
    muscle_pairs = serializers.ListField()


class WorkoutCalendarDaySerializer(serializers.Serializer):
    """Serializer for single calendar day"""
    date = serializers.DateField()
    has_workout = serializers.BooleanField()
    workout_count = serializers.IntegerField()
    total_points = serializers.IntegerField()


class ConsistencyDataSerializer(serializers.Serializer):
    """Serializer for consistency data response"""
    current_streak = serializers.IntegerField()
    longest_streak = serializers.IntegerField()
    workout_calendar = WorkoutCalendarDaySerializer(many=True)
    weekly_consistency = serializers.DictField()
    day_of_week_breakdown = serializers.DictField()


class PersonalRecordSerializer(serializers.Serializer):
    """Serializer for a single personal record"""
    duration = serializers.IntegerField(required=False)
    points = serializers.IntegerField(required=False)
    count = serializers.IntegerField(required=False)
    date = serializers.DateField()
    workout_id = serializers.IntegerField()


class MilestoneSerializer(serializers.Serializer):
    """Serializer for milestone achievement"""
    type = serializers.CharField()
    value = serializers.IntegerField()
    achieved_date = serializers.DateField()


class PersonalRecordsSerializer(serializers.Serializer):
    """Serializer for personal records response"""
    records = serializers.DictField()
    recent_milestones = MilestoneSerializer(many=True)
