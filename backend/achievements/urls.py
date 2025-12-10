from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AchievementViewSet, UserAchievementViewSet

router = DefaultRouter()
router.register(r'', AchievementViewSet, basename='achievement')
router.register(r'user', UserAchievementViewSet, basename='user-achievement')

urlpatterns = [
    path('', include(router.urls)),
]
