from django.contrib import admin
from .models import Exercise, WorkoutPreset


@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ['name', 'primary_muscle', 'equipment', 'difficulty', 'has_media']
    list_filter = ['primary_muscle', 'equipment', 'difficulty']
    search_fields = ['name', 'description']
    ordering = ['primary_muscle', 'name']

    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'primary_muscle', 'secondary_muscles', 'equipment', 'difficulty')
        }),
        ('Workout Parameters', {
            'fields': ('sets_min', 'sets_max', 'reps_min', 'reps_max', 'rest_seconds')
        }),
        ('Instructions', {
            'fields': ('description', 'instructions', 'tips')
        }),
        ('Media (Optional)', {
            'fields': ('image_url', 'gif_url', 'video_url'),
            'description': 'Add URLs to exercise demonstrations. GIF URLs will be prioritized over images in the UI.'
        }),
    )

    def has_media(self, obj):
        return bool(obj.image_url or obj.gif_url or obj.video_url)
    has_media.boolean = True
    has_media.short_description = 'Has Media'


@admin.register(WorkoutPreset)
class WorkoutPresetAdmin(admin.ModelAdmin):
    list_display = ['name', 'recommended_level']
    list_filter = ['recommended_level']
    search_fields = ['name', 'description']
