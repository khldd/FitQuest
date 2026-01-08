from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from django.utils import timezone
from .models import (
    WorkoutHistory, GeneratedWorkout,
    WorkoutProgram, ProgramDay, 
    UserProgramEnrollment, ProgramDayCompletion
)
from .serializers import (
    WorkoutHistorySerializer,
    GeneratedWorkoutSerializer,
    WorkoutGenerationRequestSerializer,
    AnalyticsSummarySerializer,
    TrendsDataSerializer,
    MuscleAnalyticsSerializer,
    ConsistencyDataSerializer,
    PersonalRecordsSerializer,
    WorkoutProgramListSerializer,
    WorkoutProgramDetailSerializer,
    ProgramDaySerializer,
    UserProgramEnrollmentSerializer,
    UserProgramEnrollmentDetailSerializer,
    EnrollProgramSerializer,
    CompleteProgramDaySerializer,
    ProgramDayCompletionSerializer,
)
from .workout_generator import WorkoutGenerator
from .analytics import WorkoutAnalyticsService


# ============== Program ViewSets ==============

class WorkoutProgramViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for browsing workout programs"""
    queryset = WorkoutProgram.objects.filter(is_active=True)
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['difficulty', 'goal', 'equipment_needed', 'is_featured']
    search_fields = ['name', 'description']
    ordering_fields = ['weeks', 'difficulty', 'created_at']
    ordering = ['-is_featured', 'difficulty']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return WorkoutProgramDetailSerializer
        return WorkoutProgramListSerializer

    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured programs"""
        featured = self.queryset.filter(is_featured=True)[:6]
        serializer = WorkoutProgramListSerializer(featured, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def schedule(self, request, pk=None):
        """Get full schedule/calendar for a program"""
        program = self.get_object()
        days = program.program_days.all()
        
        # Organize by week
        schedule = {}
        for day in days:
            week_key = f"week_{day.week_number}"
            if week_key not in schedule:
                schedule[week_key] = {
                    'week_number': day.week_number,
                    'days': []
                }
            schedule[week_key]['days'].append(ProgramDaySerializer(day).data)
        
        return Response({
            'program_id': program.id,
            'program_name': program.name,
            'total_weeks': program.weeks,
            'schedule': list(schedule.values())
        })


class UserProgramEnrollmentViewSet(viewsets.ModelViewSet):
    """ViewSet for managing user program enrollments"""
    serializer_class = UserProgramEnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'program']
    ordering = ['-started_at']

    def get_queryset(self):
        return UserProgramEnrollment.objects.filter(
            user=self.request.user
        ).select_related('program')

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return UserProgramEnrollmentDetailSerializer
        return UserProgramEnrollmentSerializer

    @action(detail=False, methods=['post'])
    def enroll(self, request):
        """Enroll in a new program"""
        serializer = EnrollProgramSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        program_id = serializer.validated_data['program_id']
        
        try:
            program = WorkoutProgram.objects.get(id=program_id, is_active=True)
        except WorkoutProgram.DoesNotExist:
            return Response(
                {'error': 'Program not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if already enrolled
        existing = UserProgramEnrollment.objects.filter(
            user=request.user,
            program=program,
            status='active'
        ).first()
        
        if existing:
            return Response(
                {'error': 'Already enrolled in this program', 'enrollment': UserProgramEnrollmentSerializer(existing).data},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create enrollment
        enrollment = UserProgramEnrollment.objects.create(
            user=request.user,
            program=program,
            current_week=1,
            current_day=1
        )
        
        return Response(
            UserProgramEnrollmentSerializer(enrollment).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['post'])
    def complete_day(self, request, pk=None):
        """Mark a program day as complete"""
        enrollment = self.get_object()
        
        if enrollment.status != 'active':
            return Response(
                {'error': 'Enrollment is not active'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = CompleteProgramDaySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        program_day_id = serializer.validated_data['program_day_id']
        workout_history_id = serializer.validated_data.get('workout_history_id')
        notes = serializer.validated_data.get('notes', '')
        
        try:
            program_day = ProgramDay.objects.get(
                id=program_day_id,
                program=enrollment.program
            )
        except ProgramDay.DoesNotExist:
            return Response(
                {'error': 'Program day not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if already completed
        if ProgramDayCompletion.objects.filter(
            enrollment=enrollment,
            program_day=program_day
        ).exists():
            return Response(
                {'error': 'Day already completed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get workout history if provided
        workout_history = None
        if workout_history_id:
            workout_history = WorkoutHistory.objects.filter(
                id=workout_history_id,
                user=request.user
            ).first()
        
        # Create completion record
        completion = ProgramDayCompletion.objects.create(
            enrollment=enrollment,
            program_day=program_day,
            workout_history=workout_history,
            notes=notes
        )
        
        # Update enrollment progress
        enrollment.last_workout_at = timezone.now()
        
        # Advance to next day
        next_day = program_day.day_number + 1
        next_week = program_day.week_number
        
        if next_day > enrollment.program.days_per_week:
            next_day = 1
            next_week += 1
        
        if next_week > enrollment.program.weeks:
            # Program completed!
            enrollment.status = 'completed'
            enrollment.completed_at = timezone.now()
        else:
            enrollment.current_week = next_week
            enrollment.current_day = next_day
        
        enrollment.save()
        
        return Response({
            'completion': ProgramDayCompletionSerializer(completion).data,
            'enrollment': UserProgramEnrollmentSerializer(enrollment).data,
            'program_completed': enrollment.status == 'completed'
        })

    @action(detail=True, methods=['post'])
    def pause(self, request, pk=None):
        """Pause an active enrollment"""
        enrollment = self.get_object()
        
        if enrollment.status != 'active':
            return Response(
                {'error': 'Can only pause active enrollments'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        enrollment.status = 'paused'
        enrollment.save()
        
        return Response(UserProgramEnrollmentSerializer(enrollment).data)

    @action(detail=True, methods=['post'])
    def resume(self, request, pk=None):
        """Resume a paused enrollment"""
        enrollment = self.get_object()
        
        if enrollment.status != 'paused':
            return Response(
                {'error': 'Can only resume paused enrollments'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        enrollment.status = 'active'
        enrollment.save()
        
        return Response(UserProgramEnrollmentSerializer(enrollment).data)

    @action(detail=True, methods=['post'])
    def abandon(self, request, pk=None):
        """Abandon an enrollment"""
        enrollment = self.get_object()
        
        if enrollment.status in ['completed', 'abandoned']:
            return Response(
                {'error': 'Enrollment already finished'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        enrollment.status = 'abandoned'
        enrollment.save()
        
        return Response(UserProgramEnrollmentSerializer(enrollment).data)

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get user's currently active enrollment"""
        enrollment = UserProgramEnrollment.objects.filter(
            user=request.user,
            status='active'
        ).select_related('program').first()
        
        if not enrollment:
            return Response(None)
        
        return Response(UserProgramEnrollmentDetailSerializer(enrollment).data)


# ============== Existing ViewSets ==============

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
