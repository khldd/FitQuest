from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Follow, SocialPost, PostLike, PostComment


class UserBasicSerializer(serializers.ModelSerializer):
    """Lightweight user serializer for social features"""
    avatar_url = serializers.SerializerMethodField()
    level = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'avatar_url', 'level']
    
    def get_avatar_url(self, obj):
        """Get avatar URL with fallback"""
        return getattr(obj.profile, 'avatar_url', None) if hasattr(obj, 'profile') else None
    
    def get_level(self, obj):
        """Get level with fallback"""
        return getattr(obj.profile, 'level', 1) if hasattr(obj, 'profile') else 1


class FollowSerializer(serializers.ModelSerializer):
    """Serializer for Follow model"""
    follower = UserBasicSerializer(read_only=True)
    following = UserBasicSerializer(read_only=True)
    following_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Follow
        fields = ['id', 'follower', 'following', 'following_id', 'created_at']
        read_only_fields = ['follower', 'created_at']


class PostCommentSerializer(serializers.ModelSerializer):
    """Serializer for PostComment model"""
    user = UserBasicSerializer(read_only=True)
    
    class Meta:
        model = PostComment
        fields = ['id', 'post', 'user', 'content', 'created_at']
        read_only_fields = ['user', 'created_at']


class PostLikeSerializer(serializers.ModelSerializer):
    """Serializer for PostLike model"""
    user = UserBasicSerializer(read_only=True)
    
    class Meta:
        model = PostLike
        fields = ['id', 'post', 'user', 'created_at']
        read_only_fields = ['user', 'created_at']


class SocialPostSerializer(serializers.ModelSerializer):
    """Serializer for SocialPost model"""
    user = UserBasicSerializer(read_only=True)
    likes_count = serializers.IntegerField(source='likes.count', read_only=True)
    comments_count = serializers.IntegerField(source='comments.count', read_only=True)
    user_has_liked = serializers.SerializerMethodField()
    comments = PostCommentSerializer(many=True, read_only=True)
    
    class Meta:
        model = SocialPost
        fields = [
            'id', 'user', 'post_type', 'content', 'workout_id', 
            'achievement_id', 'metadata', 'created_at',
            'likes_count', 'comments_count', 'user_has_liked', 'comments'
        ]
        read_only_fields = ['user', 'created_at']
    
    def get_user_has_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False


class CreatePostSerializer(serializers.Serializer):
    """Serializer for creating social posts"""
    post_type = serializers.ChoiceField(choices=['workout', 'achievement', 'milestone'])
    content = serializers.CharField()
    workout_id = serializers.IntegerField(required=False, allow_null=True)
    achievement_id = serializers.IntegerField(required=False, allow_null=True)
    metadata = serializers.JSONField(required=False, default=dict)
