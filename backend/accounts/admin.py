from django.contrib import admin
from .models import UserProfile


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['username', 'level', 'total_points', 'total_workouts', 'current_streak', 'longest_streak']
    search_fields = ['username', 'user__email']
    list_filter = ['level', 'created_at']
    readonly_fields = ['created_at', 'updated_at']
