from rest_framework import serializers
from .models import (
    WorkoutHistory, GeneratedWorkout, 
    WorkoutProgram, ProgramDay, 
    UserProgramEnrollment, ProgramDayCompletion
)


# ============== Program Serializers ==============

class ProgramDaySerializer(serializers.ModelSerializer):
    """Serializer for ProgramDay model"""
    
    class Meta:
        model = ProgramDay
        fields = [
            'id', 'week_number', 'day_number', 'name', 'description',
            'muscles_targeted', 'duration', 'intensity', 
            'exercise_template', 'is_rest_day'
        ]


class WorkoutProgramListSerializer(serializers.ModelSerializer):
    """Serializer for listing WorkoutPrograms (lightweight)"""
    total_workouts = serializers.ReadOnlyField()
    enrollment_count = serializers.SerializerMethodField()
    
    class Meta:
        model = WorkoutProgram
        fields = [
            'id', 'name', 'description', 'weeks', 'days_per_week',
            'difficulty', 'goal', 'icon', 'color', 'image_url',
            'estimated_duration_per_session', 'equipment_needed',
            'is_featured', 'total_workouts', 'enrollment_count'
        ]
    
    def get_enrollment_count(self, obj):
        return obj.enrollments.filter(status__in=['active', 'completed']).count()


class WorkoutProgramDetailSerializer(serializers.ModelSerializer):
    """Serializer for WorkoutProgram detail with all days"""
    total_workouts = serializers.ReadOnlyField()
    program_days = ProgramDaySerializer(many=True, read_only=True)
    user_enrollment = serializers.SerializerMethodField()
    
    class Meta:
        model = WorkoutProgram
        fields = [
            'id', 'name', 'description', 'weeks', 'days_per_week',
            'difficulty', 'goal', 'icon', 'color', 'image_url',
            'estimated_duration_per_session', 'equipment_needed',
            'is_featured', 'total_workouts', 'program_days', 'user_enrollment'
        ]
    
    def get_user_enrollment(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            enrollment = obj.enrollments.filter(
                user=request.user, 
                status='active'
            ).first()
            if enrollment:
                return UserProgramEnrollmentSerializer(enrollment).data
        return None


class ProgramDayCompletionSerializer(serializers.ModelSerializer):
    """Serializer for ProgramDayCompletion"""
    program_day_name = serializers.CharField(source='program_day.name', read_only=True)
    week_number = serializers.IntegerField(source='program_day.week_number', read_only=True)
    day_number = serializers.IntegerField(source='program_day.day_number', read_only=True)
    
    class Meta:
        model = ProgramDayCompletion
        fields = [
            'id', 'program_day', 'program_day_name', 'week_number', 
            'day_number', 'workout_history', 'completed_at', 'notes'
        ]
        read_only_fields = ['id', 'completed_at']


class UserProgramEnrollmentSerializer(serializers.ModelSerializer):
    """Serializer for UserProgramEnrollment"""
    program_name = serializers.CharField(source='program.name', read_only=True)
    program_icon = serializers.CharField(source='program.icon', read_only=True)
    program_weeks = serializers.IntegerField(source='program.weeks', read_only=True)
    program_days_per_week = serializers.IntegerField(source='program.days_per_week', read_only=True)
    completion_percentage = serializers.ReadOnlyField()
    next_workout_day = serializers.SerializerMethodField()
    completed_days_count = serializers.SerializerMethodField()
    total_days = serializers.SerializerMethodField()
    
    class Meta:
        model = UserProgramEnrollment
        fields = [
            'id', 'program', 'program_name', 'program_icon', 
            'program_weeks', 'program_days_per_week',
            'status', 'current_week', 'current_day',
            'started_at', 'completed_at', 'last_workout_at',
            'completion_percentage', 'next_workout_day',
            'completed_days_count', 'total_days'
        ]
        read_only_fields = ['id', 'started_at', 'completed_at', 'last_workout_at']
    
    def get_next_workout_day(self, obj):
        next_day = obj.next_workout_day
        if next_day:
            return ProgramDaySerializer(next_day).data
        return None
    
    def get_completed_days_count(self, obj):
        return obj.completed_days.count()
    
    def get_total_days(self, obj):
        return obj.program.total_workouts


class UserProgramEnrollmentDetailSerializer(UserProgramEnrollmentSerializer):
    """Detailed serializer with completed days"""
    completed_days = ProgramDayCompletionSerializer(many=True, read_only=True)
    program = WorkoutProgramListSerializer(read_only=True)
    
    class Meta(UserProgramEnrollmentSerializer.Meta):
        fields = UserProgramEnrollmentSerializer.Meta.fields + ['completed_days']


class EnrollProgramSerializer(serializers.Serializer):
    """Serializer for enrolling in a program"""
    program_id = serializers.IntegerField()


class CompleteProgramDaySerializer(serializers.Serializer):
    """Serializer for completing a program day"""
    program_day_id = serializers.IntegerField()
    workout_history_id = serializers.IntegerField(required=False)
    notes = serializers.CharField(required=False, allow_blank=True)


# ============== Existing Serializers ==============

class WorkoutHistorySerializer(serializers.ModelSerializer):
    """Serializer for WorkoutHistory model"""
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = WorkoutHistory
        fields = [
            'id', 'user', 'user_username', 'workout_date', 'muscles_targeted',
            'duration', 'intensity', 'goal', 'equipment', 'exercises_completed',
            'status', 'points_earned', 'created_at'
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
