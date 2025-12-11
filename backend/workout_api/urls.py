"""
URL configuration for workout_api project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.shortcuts import redirect
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)


def api_root(request):
    """Redirect to frontend based on auth status"""
    if request.user.is_authenticated:
        return redirect('http://localhost:3000/')
    else:
        return redirect('http://localhost:3000/auth/login')


urlpatterns = [
    path('', api_root, name='api_root'),
    path('admin/', admin.site.urls),

    # JWT authentication endpoints
    path('api/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # App endpoints
    path('api/accounts/', include('accounts.urls')),
    path('api/exercises/', include('exercises.urls')),
    path('api/workouts/', include('workouts.urls')),
    path('api/achievements/', include('achievements.urls')),
    path('api/nutrition/', include('nutrition.urls')),
    path('api/social/', include('social.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
