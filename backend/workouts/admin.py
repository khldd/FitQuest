from django.contrib import admin
from .models import WorkoutHistory, GeneratedWorkout


@admin.register(WorkoutHistory)
class WorkoutHistoryAdmin(admin.ModelAdmin):
    list_display = ['user', 'workout_date', 'intensity', 'duration', 'points_earned']
    list_filter = ['intensity', 'goal', 'equipment', 'workout_date']
    search_fields = ['user__username']
    date_hierarchy = 'workout_date'


@admin.register(GeneratedWorkout)
class GeneratedWorkoutAdmin(admin.ModelAdmin):
    list_display = ['user', 'intensity', 'goal', 'duration', 'created_at']
    list_filter = ['intensity', 'goal', 'equipment', 'created_at']
    search_fields = ['user__username']
    date_hierarchy = 'created_at'
