from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FollowViewSet, SocialFeedViewSet, UserSearchViewSet

router = DefaultRouter()
router.register(r'follows', FollowViewSet, basename='follow')
router.register(r'feed', SocialFeedViewSet, basename='social-feed')
router.register(r'users', UserSearchViewSet, basename='user-search')

urlpatterns = [
    path('', include(router.urls)),
]
