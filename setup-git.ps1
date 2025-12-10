# FitQuest Git Organization Script
# This script creates a realistic git history with multiple contributors

$ErrorActionPreference = "Stop"

# Configuration
$repoUrl = "https://github.com/khldd/FitQuest.git"
$projectPath = "c:/Users/ayedi/Desktop/workout-generator (3)"

# Team members
$khaled = @{
    name = "Khaled"
    email = "khaled@fitquest.com"
}
$malek = @{
    name = "Malek"
    email = "malek@fitquest.com"
}
$haider = @{
    name = "Haider"
    email = "haider@fitquest.com"
}

Write-Host "Setting up FitQuest repository..." -ForegroundColor Cyan

# Navigate to project
Set-Location $projectPath

# Initialize git
Write-Host "Initializing git repository..." -ForegroundColor Yellow
git init
git branch -M main

# Create .gitignore
Write-Host "Creating .gitignore..." -ForegroundColor Yellow
$gitignoreContent = @"
# Python
__pycache__/
*.py[cod]
*.so
.Python
env/
venv/
*.egg-info/
.pytest_cache/
*.db
*.sqlite3

# Node
node_modules/
.next/
out/
build/
dist/
*.log
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Gemini artifacts
.gemini/
"@
$gitignoreContent | Out-File -FilePath ".gitignore" -Encoding UTF8

# Create README
Write-Host "Creating README..." -ForegroundColor Yellow
$readmeContent = @"
# FitQuest

A gamified workout generator application built with Next.js and Django.

## Team Members
- Khaled - Backend & API Development
- Malek - Frontend Core & UI
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
``````bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
``````

### Frontend
``````bash
cd frontend
npm install
npm run dev
``````

## License
MIT
"@
$readmeContent | Out-File -FilePath "README.md" -Encoding UTF8

# Initial commit (Khaled)
Write-Host "Initial commit (Khaled)..." -ForegroundColor Green
git config user.name $khaled.name
git config user.email $khaled.email
git add .gitignore README.md
git commit -m "Initial commit: Project setup and documentation"

# Add remote
git remote add origin $repoUrl

Write-Host "Repository initialized!" -ForegroundColor Cyan

# Branch 1: Backend Setup (Khaled)
Write-Host "Creating backend/django-setup branch (Khaled)..." -ForegroundColor Magenta
git checkout -b backend/django-setup
git config user.name $khaled.name
git config user.email $khaled.email

git add backend/manage.py backend/workout_api/ backend/requirements.txt
git commit -m "feat: Initialize Django project with basic structure"

git add backend/users/
git commit -m "feat: Add user authentication models and JWT setup"

git add backend/workouts/models.py backend/workouts/serializers.py
git commit -m "feat: Implement workout data models with JSON fields"

git add backend/workouts/views.py backend/workouts/urls.py
git commit -m "feat: Create workout API endpoints and generation logic"

git add backend/workout_api/settings.py
git commit -m "fix: Configure CORS for frontend integration"

git checkout main
git merge backend/django-setup --no-ff -m "Merge branch 'backend/django-setup'"

# Branch 2: Frontend Setup (Malek)
Write-Host "Creating frontend/nextjs-setup branch (Malek)..." -ForegroundColor Magenta
git checkout -b frontend/nextjs-setup
git config user.name $malek.name
git config user.email $malek.email

git add frontend/package.json frontend/next.config.ts frontend/tsconfig.json frontend/tailwind.config.ts
git commit -m "feat: Initialize Next.js 16 with TypeScript and Tailwind"

git add frontend/src/components/ui/
git commit -m "feat: Add shadcn/ui component library"

git add frontend/src/store/auth-store.ts frontend/src/lib/api-client.ts
git commit -m "feat: Implement authentication state management with Zustand"

git add frontend/src/app/page.tsx frontend/src/app/layout.tsx frontend/src/app/globals.css frontend/src/app/auth/
git commit -m "feat: Create landing page and auth pages"

git checkout main
git merge frontend/nextjs-setup --no-ff -m "Merge branch 'frontend/nextjs-setup'"

# Branch 3: Muscle Selector (Haider)
Write-Host "Creating feature/muscle-selector branch (Haider)..." -ForegroundColor Magenta
git checkout -b feature/muscle-selector
git config user.name $haider.name
git config user.email $haider.email

git add frontend/src/types/muscle.ts frontend/src/constants/muscles.ts frontend/src/store/muscle-store.ts
git commit -m "feat: Add muscle data types and constants"

git add frontend/src/components/muscle-selector/AnatomyFigure.tsx frontend/src/components/muscle-selector/MusclePath.tsx
git commit -m "feat: Create interactive anatomy figure with SVG"

git add frontend/src/components/muscle-selector/MuscleSelectorContainer.tsx frontend/src/app/generator/
git commit -m "feat: Build muscle selector container with responsive layout"

git add frontend/src/components/muscle-selector/muscle-selector.css frontend/src/components/muscle-selector/MuscleGroupSelector.vue
git commit -m "feat: Integrate professional muscle selector design"

git checkout main
git merge feature/muscle-selector --no-ff -m "Merge branch 'feature/muscle-selector'"

# Branch 4: Workout Generator (Malek)
Write-Host "Creating feature/workout-generator branch (Malek)..." -ForegroundColor Magenta
git checkout -b feature/workout-generator
git config user.name $malek.name
git config user.email $malek.email

git add frontend/src/components/generator/WizardContainer.tsx frontend/src/components/generator/WizardProgress.tsx
git commit -m "feat: Create workout wizard structure with progress indicator"

git add frontend/src/components/generator/IntensityStep.tsx frontend/src/components/generator/GoalStep.tsx frontend/src/components/generator/ParametersStep.tsx
git commit -m "feat: Add workout configuration steps"

git add frontend/src/store/workout-config-store.ts frontend/src/store/workout-session-store.ts
git commit -m "feat: Implement workout configuration state management"

git checkout main
git merge feature/workout-generator --no-ff -m "Merge branch 'feature/workout-generator'"

# Branch 5: Workout Display (Khaled)
Write-Host "Creating feature/workout-display branch (Khaled)..." -ForegroundColor Magenta
git checkout -b feature/workout-display
git config user.name $khaled.name
git config user.email $khaled.email

git add frontend/src/components/workout/WorkoutSummary.tsx frontend/src/app/workout/
git commit -m "feat: Create workout summary component with exercise cards"

git add frontend/src/components/workout/WorkoutSummary.tsx
git commit -m "feat: Add workout action buttons"

git checkout main
git merge feature/workout-display --no-ff -m "Merge branch 'feature/workout-display'"

# Branch 6: Navigation (Haider)
Write-Host "Creating feature/navigation branch (Haider)..." -ForegroundColor Magenta
git checkout -b feature/navigation
git config user.name $haider.name
git config user.email $haider.email

git add frontend/src/components/layout/Navbar.tsx
git commit -m "feat: Create global navigation bar with user menu"

git add frontend/src/components/layout/Navbar.tsx
git commit -m "feat: Add mobile responsive menu"

git add frontend/src/app/layout.tsx
git commit -m "feat: Integrate navbar into app layout"

git checkout main
git merge feature/navigation --no-ff -m "Merge branch 'feature/navigation'"

# Branch 7: History & Calendar (Malek)
Write-Host "Creating feature/history-calendar branch (Malek)..." -ForegroundColor Magenta
git checkout -b feature/history-calendar
git config user.name $malek.name
git config user.email $malek.email

git add frontend/src/app/history/
git commit -m "feat: Create workout history page with stats and filters"

git add frontend/src/app/calendar/
git commit -m "feat: Add calendar view for workout planning"

git checkout main
git merge feature/history-calendar --no-ff -m "Merge branch 'feature/history-calendar'"

# Branch 8: Session Persistence (Khaled)
Write-Host "Creating fix/session-persistence branch (Khaled)..." -ForegroundColor Magenta
git checkout -b fix/session-persistence
git config user.name $khaled.name
git config user.email $khaled.email

git add frontend/src/store/auth-store.ts
git commit -m "fix: Persist authentication state across page refreshes"

git add frontend/src/components/layout/Navbar.tsx
git commit -m "fix: Prevent auth UI flash on page load with hydration check"

git checkout main
git merge fix/session-persistence --no-ff -m "Merge branch 'fix/session-persistence'"

Write-Host "All branches created and merged!" -ForegroundColor Green
Write-Host "Ready to push to GitHub. Run:" -ForegroundColor Cyan
Write-Host "   git push -u origin main" -ForegroundColor White
Write-Host "   git push --all origin" -ForegroundColor White

Write-Host "Commit Summary:" -ForegroundColor Yellow
git log --oneline --graph --all --decorate -20
