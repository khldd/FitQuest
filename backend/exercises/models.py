from django.db import models


class Exercise(models.Model):
    """Exercise database with detailed instructions"""

    MUSCLE_GROUP_CHOICES = [
        ('chest', 'Chest'),
        ('back', 'Back'),
        ('shoulders', 'Shoulders'),
        ('quads', 'Quadriceps'),
        ('hamstrings', 'Hamstrings'),
        ('glutes', 'Glutes'),
        ('calves', 'Calves'),
        ('biceps', 'Biceps'),
        ('triceps', 'Triceps'),
        ('abs', 'Abs'),
        ('obliques', 'Obliques'),
    ]

    EQUIPMENT_CHOICES = [
        ('bodyweight', 'Bodyweight'),
        ('dumbbells', 'Dumbbells'),
        ('barbell', 'Barbell'),
        ('machine', 'Machine'),
        ('cable', 'Cable'),
        ('resistance_band', 'Resistance Band'),
        ('kettlebell', 'Kettlebell'),
    ]

    DIFFICULTY_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]

    name = models.CharField(max_length=100, unique=True)
    primary_muscle = models.CharField(max_length=20, choices=MUSCLE_GROUP_CHOICES)
    secondary_muscles = models.JSONField(
        blank=True,
        default=list
    )

    equipment = models.CharField(max_length=20, choices=EQUIPMENT_CHOICES)
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES, default='intermediate')

    # Workout parameters
    sets_min = models.IntegerField(default=3)
    sets_max = models.IntegerField(default=4)
    reps_min = models.IntegerField(default=8)
    reps_max = models.IntegerField(default=12)
    rest_seconds = models.IntegerField(default=60)

    # Instructions
    description = models.TextField()
    instructions = models.JSONField(
        help_text="Step-by-step instructions"
    )
    tips = models.JSONField(
        blank=True,
        default=list,
        help_text="Exercise tips"
    )

    # Media
    image_url = models.URLField(
        blank=True,
        null=True,
        help_text="URL to exercise demonstration image"
    )
    gif_url = models.URLField(
        blank=True,
        null=True,
        help_text="URL to animated GIF demonstration"
    )
    video_url = models.URLField(
        blank=True,
        null=True,
        help_text="URL to video demonstration (YouTube, etc.)"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['primary_muscle', 'name']

    def __str__(self):
        return f"{self.name} ({self.primary_muscle})"


class WorkoutPreset(models.Model):
    """Predefined workout templates"""

    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    muscle_groups = models.JSONField(
        help_text="List of muscle groups targeted"
    )
    recommended_level = models.CharField(
        max_length=20,
        choices=Exercise.DIFFICULTY_CHOICES,
        default='intermediate'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name
