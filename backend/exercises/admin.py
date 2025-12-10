from django.contrib import admin
from .models import Exercise, WorkoutPreset


@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ['name', 'primary_muscle', 'equipment', 'difficulty']
    list_filter = ['primary_muscle', 'equipment', 'difficulty']
    search_fields = ['name', 'description']
    ordering = ['primary_muscle', 'name']


@admin.register(WorkoutPreset)
class WorkoutPresetAdmin(admin.ModelAdmin):
    list_display = ['name', 'recommended_level']
    list_filter = ['recommended_level']
    search_fields = ['name', 'description']
