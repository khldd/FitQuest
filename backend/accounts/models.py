from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator


class UserProfile(models.Model):
    """Extended user profile with workout stats and gamification"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    username = models.CharField(max_length=50, unique=True)
    bio = models.TextField(blank=True, null=True)
    avatar_url = models.URLField(blank=True, null=True)

    # Stats
    total_workouts = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    current_streak = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    longest_streak = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    last_workout_date = models.DateField(null=True, blank=True)

    # Gamification
    total_points = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    level = models.IntegerField(default=1, validators=[MinValueValidator(1)])

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-total_points']

    def __str__(self):
        return f"{self.username}'s Profile"

    def calculate_level(self):
        """Calculate level based on total points (100 points per level)"""
        return (self.total_points // 100) + 1

    def add_points(self, points):
        """Add points and recalculate level"""
        self.total_points += points
        self.level = self.calculate_level()
        self.save()
