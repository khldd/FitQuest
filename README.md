# 🏋️‍♂️ FitQuest: Your AI-Powered Personal Trainer

![FitQuest Dashboard Preview](https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)

> **Level up your fitness journey with intelligent, personalized workout generation.**

FitQuest isn't just another workout app. It's a gamified, intelligent fitness companion that adapts to your goals, equipment, and schedule. Whether you're a beginner looking to get started or an athlete pushing for new PRs, FitQuest generates the perfect routine for you in seconds.

---

## 🚀 Why FitQuest?

*   **🧠 Smart Generation**: Our algorithm creates balanced, effective workouts based on your specific muscle targets and intensity preferences.
*   **🎮 Gamified Progress**: Earn XP, unlock achievements, and maintain streaks. Fitness is a game, and you're the main character.
*   **📊 Visual Analytics**: Track your progress with beautiful charts and detailed history logs.
*   **🎯 Precision Targeting**: Interactive anatomical muscle selector ensures you hit exactly what you want to train.

## ✨ Key Features

*   **Interactive Muscle Selector**: Click-to-select anatomical interface for precise targeting.
*   **Customizable Parameters**: Adjust intensity, duration, and available equipment.
*   **Achievement System**: 25+ unlockable trophies to keep you motivated.
*   **Progress Tracking**: Detailed history, streak counters, and level progression.
*   **Smart Calendar**: Plan and review your workout schedule effortlessly.
*   **Responsive Design**: Beautiful, dark-mode UI that works perfectly on mobile and desktop.

## 🛠️ Tech Stack

Built with the latest modern web technologies for performance and scalability.

### Frontend
*   **Framework**: Next.js 16 (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **State**: Zustand
*   **Animation**: Framer Motion
*   **UI Components**: Radix UI & Lucide Icons

### Backend
*   **Framework**: Django 5.1
*   **API**: Django REST Framework
*   **Auth**: JWT Authentication
*   **Database**: SQLite (Dev) / PostgreSQL (Prod ready)

## ⚡ Getting Started

### Prerequisites
*   Node.js 18+
*   Python 3.10+

### 1. Clone the Repository
```bash
git clone https://github.com/khldd/FitQuest.git
cd FitQuest
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Mac/Linux
# source venv/bin/activate

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` and start your quest!

## 👥 The Team

*   **Khaled** - Frontend Core & UI Architecture
*   **Malek** - Feature Implementation & Integration
*   **Haider** - Backend Logic & API Development

---

<p align="center">
  Made with ❤️ and 💪 by the FitQuest Team
</p>
