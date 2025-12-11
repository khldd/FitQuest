#!/usr/bin/env python
"""Script to make user with specific email a superuser"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'workout_api.settings')
django.setup()

from django.contrib.auth.models import User

email = 'ayedik02@gmail.com'
username = 'admin'
password = 'admin123'  # Change this if you want a different password

# Try to find existing user with this email
user = User.objects.filter(email=email).first()

if not user:
    # Create new admin user
    print(f'Creating new admin user...')
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name='Admin',
        last_name='User'
    )
    print(f'✓ Created user: {user.username}')
    
    # Create profile
    from accounts.models import UserProfile
    profile, created = UserProfile.objects.get_or_create(
        user=user,
        defaults={'username': username}
    )
    if created:
        print(f'✓ Created profile for {user.username}')
else:
    print(f'✓ Found existing user: {user.username}')

# Make superuser
user.is_staff = True
user.is_superuser = True
user.save()
print(f'✓ {user.username} is now a superuser with admin access')

print(f'\n✅ Admin setup complete!')
print(f'   URL: http://localhost:8000/admin')
print(f'   Username: {user.username}')
print(f'   Password: {password if not User.objects.filter(email=email).count() > 1 else "(your existing password)"}')
print(f'   Email: {user.email}')
