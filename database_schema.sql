-- FitForge Database Schema (SQLite)
-- Generated from Django Models

-- ========================================
-- User Profile Table
-- ========================================
CREATE TABLE accounts_userprofile (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    bio TEXT,
    avatar_url VARCHAR(200),
    total_workouts INTEGER NOT NULL DEFAULT 0,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    last_workout_date DATE,
    total_points INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES auth_user(id) ON DELETE CASCADE
);

-- ========================================
-- Exercise Table
-- ========================================
CREATE TABLE exercises_exercise (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    primary_muscle VARCHAR(20) NOT NULL,
    secondary_muscles TEXT NOT NULL, -- JSON array
    equipment VARCHAR(20) NOT NULL,
    difficulty VARCHAR(20) NOT NULL DEFAULT 'intermediate',
    sets_min INTEGER NOT NULL DEFAULT 3,
    sets_max INTEGER NOT NULL DEFAULT 4,
    reps_min INTEGER NOT NULL DEFAULT 8,
    reps_max INTEGER NOT NULL DEFAULT 12,
    rest_seconds INTEGER NOT NULL DEFAULT 60,
    description TEXT NOT NULL,
    instructions TEXT NOT NULL, -- JSON array
    tips TEXT NOT NULL, -- JSON array
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,

    CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    CHECK (primary_muscle IN ('chest', 'back', 'shoulders', 'quads', 'hamstrings', 'glutes', 'calves', 'biceps', 'triceps', 'abs', 'obliques')),
    CHECK (equipment IN ('bodyweight', 'dumbbells', 'barbell', 'machine', 'cable', 'resistance_band', 'kettlebell'))
);

-- ========================================
-- Workout Preset Table
-- ========================================
CREATE TABLE exercises_workoutpreset (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    muscle_groups TEXT NOT NULL, -- JSON array
    recommended_level VARCHAR(20) NOT NULL DEFAULT 'intermediate',
    created_at DATETIME NOT NULL,

    CHECK (recommended_level IN ('beginner', 'intermediate', 'advanced'))
);

-- ========================================
-- Workout History Table
-- ========================================
CREATE TABLE workouts_workouthistory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    workout_date DATE NOT NULL,
    muscles_targeted TEXT NOT NULL, -- JSON array
    duration INTEGER NOT NULL,
    intensity VARCHAR(20) NOT NULL,
    goal VARCHAR(20),
    equipment VARCHAR(20) NOT NULL,
    exercises_completed TEXT NOT NULL, -- JSON array
    points_earned INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL,

    FOREIGN KEY (user_id) REFERENCES auth_user(id) ON DELETE CASCADE,
    CHECK (intensity IN ('light', 'moderate', 'intense')),
    CHECK (goal IN ('strength', 'hypertrophy', 'endurance')),
    CHECK (equipment IN ('bodyweight', 'home', 'gym')),
    CHECK (duration >= 1),
    CHECK (points_earned >= 0)
);

-- ========================================
-- Generated Workout Table
-- ========================================
CREATE TABLE workouts_generatedworkout (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    muscles_targeted TEXT NOT NULL, -- JSON array
    duration INTEGER NOT NULL,
    intensity VARCHAR(20) NOT NULL,
    goal VARCHAR(20) NOT NULL,
    equipment VARCHAR(20) NOT NULL,
    workout_plan TEXT NOT NULL, -- JSON object
    created_at DATETIME NOT NULL,

    FOREIGN KEY (user_id) REFERENCES auth_user(id) ON DELETE CASCADE,
    CHECK (intensity IN ('light', 'moderate', 'intense')),
    CHECK (goal IN ('strength', 'hypertrophy', 'endurance')),
    CHECK (equipment IN ('bodyweight', 'home', 'gym')),
    CHECK (duration >= 1)
);

-- ========================================
-- Achievement Table
-- ========================================
CREATE TABLE achievements_achievement (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    category VARCHAR(20) NOT NULL,
    tier VARCHAR(20) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    color VARCHAR(20) NOT NULL,
    requirement_type VARCHAR(30) NOT NULL,
    requirement_value INTEGER NOT NULL,
    points INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL,

    CHECK (category IN ('consistency', 'streak', 'variety', 'intensity', 'duration')),
    CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
    CHECK (requirement_type IN ('total_workouts', 'current_streak', 'total_duration', 'intense_workouts'))
);

-- ========================================
-- User Achievement Table (Junction Table)
-- ========================================
CREATE TABLE achievements_userachievement (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    achievement_id INTEGER NOT NULL,
    unlocked_at DATETIME NOT NULL,

    FOREIGN KEY (user_id) REFERENCES auth_user(id) ON DELETE CASCADE,
    FOREIGN KEY (achievement_id) REFERENCES achievements_achievement(id) ON DELETE CASCADE,
    UNIQUE (user_id, achievement_id)
);

-- ========================================
-- Indexes for Performance
-- ========================================
CREATE INDEX idx_workouthistory_user ON workouts_workouthistory(user_id);
CREATE INDEX idx_workouthistory_date ON workouts_workouthistory(workout_date);
CREATE INDEX idx_exercise_muscle ON exercises_exercise(primary_muscle);
CREATE INDEX idx_exercise_equipment ON exercises_exercise(equipment);
CREATE INDEX idx_userachievement_user ON achievements_userachievement(user_id);
CREATE INDEX idx_generatedworkout_user ON workouts_generatedworkout(user_id);

-- ========================================
-- Summary
-- ========================================
-- Total Tables: 7
-- - accounts_userprofile (User data & gamification)
-- - exercises_exercise (Exercise database)
-- - exercises_workoutpreset (Workout templates)
-- - workouts_workouthistory (Completed workouts log)
-- - workouts_generatedworkout (AI-generated workout plans)
-- - achievements_achievement (Achievement definitions)
-- - achievements_userachievement (User unlocked achievements)
--
-- Relationships:
-- - UserProfile 1:1 User
-- - WorkoutHistory N:1 User
-- - GeneratedWorkout N:1 User (optional)
-- - UserAchievement N:M (User <-> Achievement)
