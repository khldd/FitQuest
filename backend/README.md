# Workout Generator - Django Backend

Django REST API backend for the Workout Generator application.

## Features

- **User Management**: Registration, authentication, and profiles with gamification
- **Exercise Database**: 36+ exercises with detailed instructions
- **Workout Generation**: AI-powered workout plan generation
- **Progress Tracking**: Workout history, streaks, and achievements
- **Achievement System**: Unlockable achievements with tiers

## Tech Stack

- Django 5.0
- Django REST Framework
- PostgreSQL
- JWT Authentication
- django-cors-headers

## Setup Instructions

### 1. Prerequisites

- Python 3.10+
- PostgreSQL 14+
- pip or virtualenv

### 2. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 3. Database Setup

Create a PostgreSQL database:

```bash
createdb workout_db
```

### 4. Environment Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=workout_db
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432

CORS_ALLOWED_ORIGINS=http://localhost:4200,http://127.0.0.1:4200
```

### 5. Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Load Exercise Database

```bash
python manage.py load_exercises
```

### 7. Create Superuser (Optional)

```bash
python manage.py createsuperuser
```

### 8. Run Development Server

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000/`

## API Endpoints

### Authentication

- `POST /api/auth/token/` - Obtain JWT token
- `POST /api/auth/token/refresh/` - Refresh JWT token
- `POST /api/accounts/users/register/` - Register new user

### User Profiles

- `GET /api/accounts/profiles/me/` - Get current user's profile
- `PATCH /api/accounts/profiles/update_profile/` - Update profile

### Exercises

- `GET /api/exercises/` - List all exercises
- `GET /api/exercises/{id}/` - Get exercise details
- `GET /api/exercises/?primary_muscle=chest` - Filter by muscle
- `GET /api/exercises/?equipment=bodyweight` - Filter by equipment

### Workouts

- `POST /api/workouts/generated/generate/` - Generate workout plan
- `GET /api/workouts/history/` - Get workout history
- `POST /api/workouts/history/` - Log completed workout

### Achievements

- `GET /api/achievements/` - List all achievements
- `GET /api/achievements/user/my_achievements/` - Get user's achievements

## Admin Panel

Access the Django admin at `http://localhost:8000/admin/`

## Project Structure

```
backend/
├── workout_api/          # Django project settings
├── accounts/             # User management app
├── exercises/            # Exercise database app
├── workouts/             # Workout generation app
├── achievements/         # Achievement system app
├── manage.py
└── requirements.txt
```

## Development

### Running Tests

```bash
python manage.py test
```

### Creating Migrations

```bash
python manage.py makemigrations
```

### Shell Access

```bash
python manage.py shell
```

## Notes

- CORS is configured to allow Angular frontend at `http://localhost:4200`
- JWT tokens expire after 24 hours
- Refresh tokens expire after 7 days
