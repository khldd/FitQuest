from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from .models import WorkoutHistory, GeneratedWorkout
from .serializers import (
    WorkoutHistorySerializer,
    GeneratedWorkoutSerializer,
    WorkoutGenerationRequestSerializer
)
from .workout_generator import WorkoutGenerator


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
