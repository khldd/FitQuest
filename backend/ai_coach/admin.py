from django.contrib import admin
from .models import ChatMessage

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ['user', 'role', 'created_at', 'message_preview']
    list_filter = ['role', 'created_at']
    search_fields = ['user__username', 'content']
    readonly_fields = ['created_at']
    
    def message_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    message_preview.short_description = 'Message'
