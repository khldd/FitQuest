"""
Quick script to switch from PostgreSQL to SQLite for easy testing
Run this if you're having PostgreSQL password issues
"""

import os

settings_file = os.path.join(os.path.dirname(__file__), 'workout_api', 'settings.py')

# Read the current settings
with open(settings_file, 'r') as f:
    content = f.read()

# Replace PostgreSQL config with SQLite
old_db_config = """DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': config('DB_NAME', default='workout_db'),
        'USER': config('DB_USER', default='postgres'),
        'PASSWORD': config('DB_PASSWORD', default='postgres'),
        'HOST': config('DB_HOST', default='localhost'),
        'PORT': config('DB_PORT', default='5432'),
    }
}"""

new_db_config = """DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}"""

if old_db_config in content:
    content = content.replace(old_db_config, new_db_config)

    with open(settings_file, 'w') as f:
        f.write(content)

    print("✅ Successfully switched to SQLite!")
    print("📝 Database will be created at: backend/db.sqlite3")
    print("\n🚀 Next steps:")
    print("1. python manage.py migrate")
    print("2. python manage.py load_exercises")
    print("3. python manage.py runserver")
else:
    print("⚠️  Could not find PostgreSQL config. Already using SQLite?")
