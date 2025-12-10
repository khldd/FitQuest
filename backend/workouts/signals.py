from django.db.models.signals import post_save
from django.dispatch import receiver
from datetime import date, timedelta
from .models import WorkoutHistory


@receiver(post_save, sender=WorkoutHistory)
def update_user_stats(sender, instance, created, **kwargs):
    """Update user profile stats when a workout is completed"""
    if created:
        profile = instance.user.profile

        # Update total workouts
        profile.total_workouts += 1

        # Update streaks
        today = date.today()
        if profile.last_workout_date:
            days_diff = (today - profile.last_workout_date).days

            if days_diff == 1:
                # Consecutive day - increment streak
                profile.current_streak += 1
            elif days_diff == 0:
                # Same day - don't change streak
                pass
            else:
                # Streak broken - reset to 1
                profile.current_streak = 1
        else:
            # First workout
            profile.current_streak = 1

        # Update longest streak if current is higher
        if profile.current_streak > profile.longest_streak:
            profile.longest_streak = profile.current_streak

        # Update last workout date
        profile.last_workout_date = today

        # Add points
        profile.add_points(instance.points_earned)

        profile.save()
