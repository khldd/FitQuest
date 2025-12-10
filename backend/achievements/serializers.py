from rest_framework import serializers
from .models import Achievement, UserAchievement


class AchievementSerializer(serializers.ModelSerializer):
    """Serializer for Achievement model"""
    class Meta:
        model = Achievement
        fields = [
            'id', 'name', 'description', 'category', 'tier', 'icon', 'color',
            'requirement_type', 'requirement_value', 'points', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class UserAchievementSerializer(serializers.ModelSerializer):
    """Serializer for UserAchievement model"""
    achievement = AchievementSerializer(read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = UserAchievement
        fields = ['id', 'user', 'user_username', 'achievement', 'unlocked_at']
        read_only_fields = ['id', 'user', 'unlocked_at']
