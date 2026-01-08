from django.contrib import admin
from .models import (
    WorkoutHistory, GeneratedWorkout,
    WorkoutProgram, ProgramDay,
    UserProgramEnrollment, ProgramDayCompletion
)


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


class ProgramDayInline(admin.TabularInline):
    model = ProgramDay
    extra = 1
    ordering = ['week_number', 'day_number']


@admin.register(WorkoutProgram)
class WorkoutProgramAdmin(admin.ModelAdmin):
    list_display = ['name', 'weeks', 'days_per_week', 'difficulty', 'goal', 'is_featured', 'is_active']
    list_filter = ['difficulty', 'goal', 'equipment_needed', 'is_featured', 'is_active']
    search_fields = ['name', 'description']
    inlines = [ProgramDayInline]
    list_editable = ['is_featured', 'is_active']


@admin.register(ProgramDay)
class ProgramDayAdmin(admin.ModelAdmin):
    list_display = ['program', 'week_number', 'day_number', 'name', 'duration', 'intensity']
    list_filter = ['program', 'week_number', 'intensity']
    search_fields = ['name', 'program__name']
    ordering = ['program', 'week_number', 'day_number']


@admin.register(UserProgramEnrollment)
class UserProgramEnrollmentAdmin(admin.ModelAdmin):
    list_display = ['user', 'program', 'status', 'current_week', 'current_day', 'started_at']
    list_filter = ['status', 'program', 'started_at']
    search_fields = ['user__username', 'program__name']
    date_hierarchy = 'started_at'
    readonly_fields = ['completion_percentage']


@admin.register(ProgramDayCompletion)
class ProgramDayCompletionAdmin(admin.ModelAdmin):
    list_display = ['enrollment', 'program_day', 'completed_at']
    list_filter = ['completed_at', 'enrollment__program']
    search_fields = ['enrollment__user__username']
    date_hierarchy = 'completed_at'
