from rest_framework import serializers
from .models import ChatMessage
from workouts.models import WorkoutHistory
from achievements.models import Achievement, UserAchievement
from accounts.models import UserProfile


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['id', 'role', 'content', 'created_at', 'metadata']
        read_only_fields = ['id', 'created_at']


class UserContextSerializer(serializers.Serializer):
    """Serialize user context to send to AI (n8n workflow)"""
    
    # User profile info
    username = serializers.CharField()
    fitness_goal = serializers.CharField()
    level = serializers.IntegerField()
    total_points = serializers.IntegerField()
    current_streak = serializers.IntegerField()
    
    # Recent workout stats
    total_workouts = serializers.IntegerField()
    recent_workouts = serializers.ListField(child=serializers.DictField())
    favorite_muscle_groups = serializers.ListField(child=serializers.CharField())
    
    # Achievements
    recent_achievements = serializers.ListField(child=serializers.DictField())
    
    # Nutrition (if available)
    nutrition_goal = serializers.DictField(required=False, allow_null=True)
    
    @staticmethod
    def get_user_context(user):
        """Generate comprehensive user context for AI"""
        try:
            profile = UserProfile.objects.get(user=user)
        except UserProfile.DoesNotExist:
            profile = None
        except Exception as e:
            print(f"Error getting profile: {e}")
            profile = None
        
        # Get recent workouts (last 7 days)
        try:
            recent_workouts = WorkoutHistory.objects.filter(
                user=user
            ).order_by('-workout_date')[:10]
            
            recent_workout_data = [{
                'date': workout.workout_date.isoformat(),
                'muscles': workout.muscles_targeted,
                'intensity': workout.intensity,
                'goal': workout.goal,
                'duration': workout.duration,
                'status': workout.status,
            } for workout in recent_workouts]
            total_workouts = recent_workouts.count()
        except Exception as e:
            print(f"Error getting workouts: {e}")
            recent_workout_data = []
            total_workouts = 0
        
        # Get favorite muscle groups
        try:
            from django.db.models import Count
            favorite_muscles = WorkoutHistory.objects.filter(
                user=user
            ).values('muscles_targeted').annotate(
                count=Count('id')
            ).order_by('-count')[:3]
            
            favorite_muscle_list = [
                muscle['muscles_targeted'] for muscle in favorite_muscles
            ]
        except Exception as e:
            print(f"Error getting favorite muscles: {e}")
            favorite_muscle_list = []
        
        # Get recent achievements
        try:
            recent_achievements_qs = UserAchievement.objects.filter(
                user=user
            ).exclude(unlocked_at__isnull=True).select_related('achievement').order_by('-unlocked_at')[:5]
            
            achievement_data = [{
                'name': ua.achievement.name,
                'description': ua.achievement.description,
                'category': ua.achievement.category,
                'tier': ua.achievement.tier,
                'unlocked_at': ua.unlocked_at.isoformat(),
            } for ua in recent_achievements_qs]
        except Exception as e:
            print(f"Error getting achievements: {e}")
            achievement_data = []
        
        # Get nutrition goal if available
        nutrition_goal = None
        try:
            from nutrition.models import NutritionGoal
            goal = NutritionGoal.objects.filter(user=user).first()
            if goal:
                nutrition_goal = {
                    'daily_calories': goal.daily_calories,
                    'daily_protein': goal.daily_protein,
                    'daily_carbs': goal.daily_carbs,
                    'daily_fat': goal.daily_fat,
                    'goal_type': goal.goal_type,
                }
        except Exception:
            pass
        
        return {
            'username': user.username,
            'fitness_goal': 'general_fitness',  # Can be enhanced later
            'level': profile.level if profile else 1,
            'total_points': profile.total_points if profile else 0,
            'current_streak': profile.current_streak if profile else 0,
            'total_workouts': total_workouts,
            'recent_workouts': recent_workout_data,
            'favorite_muscle_groups': favorite_muscle_list,
            'recent_achievements': achievement_data,
            'nutrition_goal': nutrition_goal,
        }
