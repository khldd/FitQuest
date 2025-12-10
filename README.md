# FitQuest

A gamified workout generator application built with Next.js and Django.

## Team Members
- Khaled - Frontend Core & UI
- Malek - Backend & API Development
- Haider - Features & Integration

## Tech Stack

### Frontend
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Zustand (State Management)
- Framer Motion (Animations)

### Backend
- Django 5.1
- Django REST Framework
- JWT Authentication
- SQLite (Development)

## Features
- Interactive muscle selection with anatomical SVG
- Personalized workout generation
- Workout history tracking
- Calendar view for planning
- User authentication & sessions
- Fully responsive design

## Setup

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## License
MIT
