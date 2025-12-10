from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Achievement, UserAchievement
from .serializers import AchievementSerializer, UserAchievementSerializer


class AchievementViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Achievement model (read-only)"""
    queryset = Achievement.objects.all()
    serializer_class = AchievementSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['category', 'tier', 'requirement_type']
    ordering_fields = ['category', 'tier', 'requirement_value', 'points']
    ordering = ['category', 'tier', 'requirement_value']


class UserAchievementViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for UserAchievement model (read-only)"""
    queryset = UserAchievement.objects.all()
    serializer_class = UserAchievementSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['achievement__category', 'achievement__tier']
    ordering_fields = ['unlocked_at']
    ordering = ['-unlocked_at']

    def get_queryset(self):
        # Users can only see their own achievements
        return UserAchievement.objects.filter(user=self.request.user)

    @action(detail=False, methods=['get'])
    def my_achievements(self, request):
        """Get all achievements for the current user with unlock status"""
        all_achievements = Achievement.objects.all()
        unlocked_ids = UserAchievement.objects.filter(
            user=request.user
        ).values_list('achievement_id', flat=True)

        achievements_data = []
        for achievement in all_achievements:
            data = AchievementSerializer(achievement).data
            data['unlocked'] = achievement.id in unlocked_ids
            if data['unlocked']:
                user_achievement = UserAchievement.objects.get(
                    user=request.user, achievement=achievement
                )
                data['unlocked_at'] = user_achievement.unlocked_at
            else:
                data['unlocked_at'] = None
            achievements_data.append(data)

        return Response(achievements_data)
