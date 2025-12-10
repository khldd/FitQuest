from django.db.models.signals import post_save
from django.dispatch import receiver
from workouts.models import WorkoutHistory
from .models import Achievement, UserAchievement


@receiver(post_save, sender=WorkoutHistory)
def check_achievements(sender, instance, created, **kwargs):
    """Check and unlock achievements when workout is completed"""
    if created:
        user = instance.user
        profile = user.profile

        # Get all achievements not yet unlocked by this user
        unlocked_ids = UserAchievement.objects.filter(user=user).values_list('achievement_id', flat=True)
        available_achievements = Achievement.objects.exclude(id__in=unlocked_ids)

        newly_unlocked = []

        for achievement in available_achievements:
            unlock = False

            if achievement.requirement_type == 'total_workouts':
                unlock = profile.total_workouts >= achievement.requirement_value
            elif achievement.requirement_type == 'current_streak':
                unlock = profile.current_streak >= achievement.requirement_value
            elif achievement.requirement_type == 'total_duration':
                total_duration = WorkoutHistory.objects.filter(user=user).aggregate(
                    models.Sum('duration')
                )['duration__sum'] or 0
                unlock = total_duration >= achievement.requirement_value
            elif achievement.requirement_type == 'intense_workouts':
                intense_count = WorkoutHistory.objects.filter(
                    user=user, intensity='intense'
                ).count()
                unlock = intense_count >= achievement.requirement_value

            if unlock:
                # Unlock the achievement
                UserAchievement.objects.create(user=user, achievement=achievement)
                newly_unlocked.append(achievement)

                # Award points
                profile.add_points(achievement.points)


from django.db import models
