from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator
import json


class WorkoutProgram(models.Model):
    """Pre-defined multi-week workout programs"""

    DIFFICULTY_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]

    GOAL_CHOICES = [
        ('strength', 'Build Strength'),
        ('hypertrophy', 'Build Muscle'),
        ('endurance', 'Build Endurance'),
        ('weight_loss', 'Lose Weight'),
        ('general_fitness', 'General Fitness'),
    ]

    name = models.CharField(max_length=100)
    description = models.TextField()
    weeks = models.IntegerField(validators=[MinValueValidator(1)])
    days_per_week = models.IntegerField(validators=[MinValueValidator(1)], default=3)
    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES)
    goal = models.CharField(max_length=20, choices=GOAL_CHOICES)
    
    # Visual/display fields
    icon = models.CharField(max_length=50, default='💪')
    color = models.CharField(max_length=20, default='blue')
    image_url = models.URLField(blank=True, null=True)
    
    # Metadata
    estimated_duration_per_session = models.IntegerField(
        default=45,
        help_text="Average duration per session in minutes"
    )
    equipment_needed = models.CharField(
        max_length=20, 
        choices=[
            ('bodyweight', 'Bodyweight'),
            ('home', 'Home Equipment'),
            ('gym', 'Full Gym'),
        ],
        default='gym'
    )
    
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-is_featured', 'difficulty', 'name']

    def __str__(self):
        return f"{self.name} ({self.weeks} weeks)"

    @property
    def total_workouts(self):
        return self.weeks * self.days_per_week


class ProgramDay(models.Model):
    """Individual workout day within a program"""

    INTENSITY_CHOICES = [
        ('light', 'Light'),
        ('moderate', 'Moderate'),
        ('intense', 'Intense'),
    ]

    program = models.ForeignKey(
        WorkoutProgram, 
        on_delete=models.CASCADE, 
        related_name='program_days'
    )
    week_number = models.IntegerField(validators=[MinValueValidator(1)])
    day_number = models.IntegerField(validators=[MinValueValidator(1)])
    
    name = models.CharField(max_length=100, help_text="e.g., 'Push Day', 'Leg Day'")
    description = models.TextField(blank=True)
    
    # Workout template
    muscles_targeted = models.JSONField(
        help_text="List of muscle groups targeted"
    )
    duration = models.IntegerField(
        validators=[MinValueValidator(1)],
        help_text="Duration in minutes"
    )
    intensity = models.CharField(max_length=20, choices=INTENSITY_CHOICES)
    
    # Exercise template (optional - can use workout generator)
    exercise_template = models.JSONField(
        null=True, 
        blank=True,
        help_text="Pre-defined exercises for this day, or null to generate"
    )
    
    # Rest day flag
    is_rest_day = models.BooleanField(default=False)

    class Meta:
        ordering = ['week_number', 'day_number']
        unique_together = ['program', 'week_number', 'day_number']

    def __str__(self):
        return f"{self.program.name} - Week {self.week_number}, Day {self.day_number}: {self.name}"


class UserProgramEnrollment(models.Model):
    """Tracks user enrollment and progress in a program"""

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('completed', 'Completed'),
        ('abandoned', 'Abandoned'),
    ]

    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='program_enrollments'
    )
    program = models.ForeignKey(
        WorkoutProgram, 
        on_delete=models.CASCADE, 
        related_name='enrollments'
    )
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    
    # Progress tracking
    current_week = models.IntegerField(default=1)
    current_day = models.IntegerField(default=1)
    
    # Dates
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    last_workout_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-started_at']
        # User can only have one active enrollment per program
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'program'],
                condition=models.Q(status='active'),
                name='unique_active_enrollment'
            )
        ]

    def __str__(self):
        return f"{self.user.username} - {self.program.name} ({self.status})"

    @property
    def completion_percentage(self):
        total_days = self.program.total_workouts
        completed_days = self.completed_days.count()
        return round((completed_days / total_days) * 100, 1) if total_days > 0 else 0

    @property
    def next_workout_day(self):
        """Get the next program day to complete"""
        return ProgramDay.objects.filter(
            program=self.program,
            week_number=self.current_week,
            day_number=self.current_day
        ).first()


class ProgramDayCompletion(models.Model):
    """Tracks completion of individual program days"""

    enrollment = models.ForeignKey(
        UserProgramEnrollment, 
        on_delete=models.CASCADE, 
        related_name='completed_days'
    )
    program_day = models.ForeignKey(
        ProgramDay, 
        on_delete=models.CASCADE, 
        related_name='completions'
    )
    workout_history = models.ForeignKey(
        'WorkoutHistory',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='program_completions'
    )
    
    completed_at = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)

    class Meta:
        ordering = ['-completed_at']
        unique_together = ['enrollment', 'program_day']

    def __str__(self):
        return f"{self.enrollment.user.username} completed {self.program_day}"


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
