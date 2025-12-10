from django.contrib import admin
from .models import Achievement, UserAchievement


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'tier', 'requirement_type', 'requirement_value', 'points']
    list_filter = ['category', 'tier', 'requirement_type']
    search_fields = ['name', 'description']


@admin.register(UserAchievement)
class UserAchievementAdmin(admin.ModelAdmin):
    list_display = ['user', 'achievement', 'unlocked_at']
    list_filter = ['achievement__category', 'achievement__tier', 'unlocked_at']
    search_fields = ['user__username', 'achievement__name']
    date_hierarchy = 'unlocked_at'
