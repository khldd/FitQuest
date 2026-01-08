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
    queryset = UserAchievement.objects.select_related('achievement')
    serializer_class = UserAchievementSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['achievement__category', 'achievement__tier']
    ordering_fields = ['unlocked_at']
    ordering = ['-unlocked_at']

    def get_queryset(self):
        # Users can only see their own achievements with related data pre-fetched
        return UserAchievement.objects.filter(
            user=self.request.user
        ).select_related('achievement')

    @action(detail=False, methods=['get'])
    def my_achievements(self, request):
        """Get all achievements for the current user with unlock status"""
        # Fetch all achievements in a single query
        all_achievements = Achievement.objects.all()
        
        # Bulk fetch all user achievements in a single query and create a lookup dict
        user_achievements = UserAchievement.objects.filter(
            user=request.user
        ).select_related('achievement')
        
        # Create a dictionary for O(1) lookup: achievement_id -> unlocked_at
        unlocked_map = {
            ua.achievement_id: ua.unlocked_at 
            for ua in user_achievements
        }

        # Build response without N+1 queries
        achievements_data = []
        for achievement in all_achievements:
            data = AchievementSerializer(achievement).data
            unlocked_at = unlocked_map.get(achievement.id)
            data['unlocked'] = unlocked_at is not None
            data['unlocked_at'] = unlocked_at
            achievements_data.append(data)

        return Response(achievements_data)
