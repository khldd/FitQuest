from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from .models import WorkoutHistory, GeneratedWorkout
from .serializers import (
    WorkoutHistorySerializer,
    GeneratedWorkoutSerializer,
    WorkoutGenerationRequestSerializer,
    AnalyticsSummarySerializer,
    TrendsDataSerializer,
    MuscleAnalyticsSerializer,
    ConsistencyDataSerializer,
    PersonalRecordsSerializer
)
from .workout_generator import WorkoutGenerator
from .analytics import WorkoutAnalyticsService


class WorkoutHistoryViewSet(viewsets.ModelViewSet):
    """ViewSet for WorkoutHistory model"""
    queryset = WorkoutHistory.objects.all()
    serializer_class = WorkoutHistorySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['intensity', 'goal', 'equipment', 'workout_date']
    ordering_fields = ['workout_date', 'duration', 'points_earned']
    ordering = ['-workout_date']

    def get_queryset(self):
        # Users can only see their own workout history
        return WorkoutHistory.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def update(self, request, *args, **kwargs):
        # Get user's unlocked achievements before updating workout
        from achievements.models import UserAchievement, Achievement
        from achievements.serializers import AchievementSerializer
        
        before_achievements = set(
            UserAchievement.objects.filter(user=request.user).values_list('achievement_id', flat=True)
        )
        
        # Update the workout (this triggers the signal if status changed to completed)
        response = super().update(request, *args, **kwargs)
        
        # Check for newly unlocked achievements
        after_achievements = set(
            UserAchievement.objects.filter(user=request.user).values_list('achievement_id', flat=True)
        )
        
        newly_unlocked_ids = after_achievements - before_achievements
        
        if newly_unlocked_ids:
            newly_unlocked = Achievement.objects.filter(id__in=newly_unlocked_ids)
            achievements_data = AchievementSerializer(newly_unlocked, many=True).data
            response.data['newly_unlocked_achievements'] = achievements_data
        else:
            response.data['newly_unlocked_achievements'] = []
        
        return response

    def create(self, request, *args, **kwargs):
        # Get user's unlocked achievements before creating workout
        from achievements.models import UserAchievement
        from achievements.serializers import AchievementSerializer
        
        before_achievements = set(
            UserAchievement.objects.filter(user=request.user).values_list('achievement_id', flat=True)
        )
        
        # Create the workout (this triggers the signal)
        response = super().create(request, *args, **kwargs)
        
        # Check for newly unlocked achievements
        after_achievements = set(
            UserAchievement.objects.filter(user=request.user).values_list('achievement_id', flat=True)
        )
        
        newly_unlocked_ids = after_achievements - before_achievements
        
        if newly_unlocked_ids:
            from achievements.models import Achievement
            newly_unlocked = Achievement.objects.filter(id__in=newly_unlocked_ids)
            achievements_data = AchievementSerializer(newly_unlocked, many=True).data
            response.data['newly_unlocked_achievements'] = achievements_data
        else:
            response.data['newly_unlocked_achievements'] = []
        
        return response

    @action(detail=False, methods=['get'])
    def analytics_summary(self, request):
        """Get analytics summary for user's workouts"""
        # Parse query parameters
        period = request.query_params.get('period', '30d')
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')

        # Parse dates
        start_date, end_date, label = WorkoutAnalyticsService.parse_period(
            period, start_date_str, end_date_str
        )

        # Get summary data
        summary_data = WorkoutAnalyticsService.get_summary(
            request.user, start_date, end_date
        )

        # Add period info
        response_data = {
            'period': {
                'start': start_date.strftime('%Y-%m-%d') if start_date else None,
                'end': end_date.strftime('%Y-%m-%d'),
                'label': label
            },
            **summary_data
        }

        serializer = AnalyticsSummarySerializer(response_data)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def analytics_trends(self, request):
        """Get workout trends over time"""
        # Parse query parameters
        period = request.query_params.get('period', '30d')
        granularity = request.query_params.get('granularity', 'daily')
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')

        # Parse dates
        start_date, end_date, _ = WorkoutAnalyticsService.parse_period(
            period, start_date_str, end_date_str
        )

        # Get trends data
        trends_data = WorkoutAnalyticsService.get_trends(
            request.user, start_date, end_date, granularity
        )

        serializer = TrendsDataSerializer(trends_data)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def analytics_muscles(self, request):
        """Get muscle group analytics"""
        # Parse query parameters
        period = request.query_params.get('period', '30d')
        top_n = int(request.query_params.get('top_n', 10))
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')

        # Parse dates
        start_date, end_date, _ = WorkoutAnalyticsService.parse_period(
            period, start_date_str, end_date_str
        )

        # Get muscle analytics
        muscle_data = WorkoutAnalyticsService.get_muscle_analytics(
            request.user, start_date, end_date, top_n
        )

        serializer = MuscleAnalyticsSerializer(muscle_data)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def analytics_consistency(self, request):
        """Get consistency and calendar data"""
        # Parse query parameters
        period = request.query_params.get('period', '90d')
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')

        # Parse dates
        start_date, end_date, _ = WorkoutAnalyticsService.parse_period(
            period, start_date_str, end_date_str
        )

        # Get consistency data
        consistency_data = WorkoutAnalyticsService.get_consistency(
            request.user, start_date, end_date
        )

        serializer = ConsistencyDataSerializer(consistency_data)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def analytics_records(self, request):
        """Get personal records and milestones"""
        # Get records data
        records_data = WorkoutAnalyticsService.get_records(request.user)

        serializer = PersonalRecordsSerializer(records_data)
        return Response(serializer.data)


class GeneratedWorkoutViewSet(viewsets.ModelViewSet):
    """ViewSet for GeneratedWorkout model"""
    queryset = GeneratedWorkout.objects.all()
    serializer_class = GeneratedWorkoutSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        if self.request.user.is_authenticated:
            return GeneratedWorkout.objects.filter(user=self.request.user)
        return GeneratedWorkout.objects.filter(user__isnull=True)

    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(user=self.request.user)
        else:
            serializer.save()

    @action(detail=False, methods=['post'])
    def generate(self, request):
        """Generate a new workout plan"""
        serializer = WorkoutGenerationRequestSerializer(data=request.data)
        if serializer.is_valid():
            generator = WorkoutGenerator()
            workout_plan = generator.generate_workout(
                muscles_targeted=serializer.validated_data['muscles_targeted'],
                duration=serializer.validated_data['duration'],
                intensity=serializer.validated_data['intensity'],
                goal=serializer.validated_data['goal'],
                equipment=serializer.validated_data['equipment']
            )

            # Save the generated workout
            generated_workout = GeneratedWorkout.objects.create(
                user=request.user if request.user.is_authenticated else None,
                muscles_targeted=serializer.validated_data['muscles_targeted'],
                duration=serializer.validated_data['duration'],
                intensity=serializer.validated_data['intensity'],
                goal=serializer.validated_data['goal'],
                equipment=serializer.validated_data['equipment'],
                workout_plan=workout_plan
            )

            return Response(
                GeneratedWorkoutSerializer(generated_workout).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
