from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator
import json


class WorkoutHistory(models.Model):
    """Log of completed workouts"""

    INTENSITY_CHOICES = [
        ('light', 'Light'),
        ('moderate', 'Moderate'),
        ('intense', 'Intense'),
    ]

    GOAL_CHOICES = [
        ('strength', 'Strength'),
        ('hypertrophy', 'Hypertrophy'),
        ('endurance', 'Endurance'),
    ]

    EQUIPMENT_CHOICES = [
        ('bodyweight', 'Bodyweight'),
        ('home', 'Home Equipment'),
        ('gym', 'Full Gym'),
    ]

    STATUS_CHOICES = [
        ('planned', 'Planned'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='workout_history')
    workout_date = models.DateField(auto_now_add=True)

    # Workout parameters
    muscles_targeted = models.JSONField(
        help_text="List of muscle groups targeted"
    )
    duration = models.IntegerField(
        validators=[MinValueValidator(1)],
        help_text="Duration in minutes"
    )
    intensity = models.CharField(max_length=20, choices=INTENSITY_CHOICES)
    goal = models.CharField(max_length=20, choices=GOAL_CHOICES, null=True, blank=True)
    equipment = models.CharField(max_length=20, choices=EQUIPMENT_CHOICES)

    # Workout details (stored as JSON)
    exercises_completed = models.JSONField(
        help_text="List of exercises with sets, reps, etc."
    )

    # Status tracking
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='completed',
        help_text="Current status of the workout"
    )

    # Points earned
    points_earned = models.IntegerField(default=0, validators=[MinValueValidator(0)])

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-workout_date', '-created_at']
        verbose_name_plural = 'Workout histories'

    def __str__(self):
        return f"{self.user.username} - {self.workout_date}"

    def calculate_points(self):
        """Calculate points based on duration and intensity"""
        base_points = self.duration
        intensity_multiplier = {
            'light': 1.0,
            'moderate': 1.5,
            'intense': 2.0
        }
        return int(base_points * intensity_multiplier.get(self.intensity, 1.0))

    def save(self, *args, **kwargs):
        # Only calculate points for completed workouts
        if self.status == 'completed' and not self.points_earned:
            self.points_earned = self.calculate_points()
        super().save(*args, **kwargs)


class GeneratedWorkout(models.Model):
    """Temporarily store generated workout plans"""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='generated_workouts', null=True, blank=True)

    # Workout parameters
    muscles_targeted = models.JSONField(
        help_text="List of muscle groups targeted"
    )
    duration = models.IntegerField(
        validators=[MinValueValidator(1)],
        help_text="Duration in minutes"
    )
    intensity = models.CharField(max_length=20, choices=WorkoutHistory.INTENSITY_CHOICES)
    goal = models.CharField(max_length=20, choices=WorkoutHistory.GOAL_CHOICES)
    equipment = models.CharField(max_length=20, choices=WorkoutHistory.EQUIPMENT_CHOICES)

    # Generated exercises
    workout_plan = models.JSONField(
        help_text="Complete workout plan with exercises"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        user_str = self.user.username if self.user else 'Anonymous'
        return f"{user_str} - {self.created_at.strftime('%Y-%m-%d')}"
