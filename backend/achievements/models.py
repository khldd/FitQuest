from django.db import models
from django.contrib.auth.models import User


class Achievement(models.Model):
    """Achievement definitions"""

    TIER_CHOICES = [
        ('bronze', 'Bronze'),
        ('silver', 'Silver'),
        ('gold', 'Gold'),
        ('platinum', 'Platinum'),
    ]

    CATEGORY_CHOICES = [
        ('consistency', 'Consistency'),
        ('streak', 'Streak'),
        ('variety', 'Variety'),
        ('intensity', 'Intensity'),
        ('duration', 'Duration'),
    ]

    REQUIREMENT_TYPE_CHOICES = [
        ('total_workouts', 'Total Workouts'),
        ('current_streak', 'Current Streak'),
        ('total_duration', 'Total Duration'),
        ('intense_workouts', 'Intense Workouts'),
    ]

    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    tier = models.CharField(max_length=20, choices=TIER_CHOICES)

    icon = models.CharField(max_length=50, help_text="Icon name or emoji")
    color = models.CharField(max_length=20, help_text="Color for the badge")

    requirement_type = models.CharField(max_length=30, choices=REQUIREMENT_TYPE_CHOICES)
    requirement_value = models.IntegerField(help_text="Value needed to unlock")

    points = models.IntegerField(default=0, help_text="Points awarded when unlocked")

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['category', 'tier', 'requirement_value']

    def __str__(self):
        return f"{self.name} ({self.tier})"


class UserAchievement(models.Model):
    """Tracks which achievements users have unlocked"""

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='achievements')
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    unlocked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['user', 'achievement']
        ordering = ['-unlocked_at']

    def __str__(self):
        return f"{self.user.username} - {self.achievement.name}"
