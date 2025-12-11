"""
Workout Generation Algorithm
"""
import random
from exercises.models import Exercise


class WorkoutGenerator:
    """Generates personalized workout plans based on user preferences"""

    def __init__(self):
        self.intensity_multipliers = {
            'light': {'sets': 0.75, 'reps': 0.8, 'rest': 1.2},
            'moderate': {'sets': 1.0, 'reps': 1.0, 'rest': 1.0},
            'intense': {'sets': 1.25, 'reps': 1.2, 'rest': 0.8}
        }

        self.goal_reps = {
            'strength': {'min': 4, 'max': 6},
            'hypertrophy': {'min': 8, 'max': 12},
            'endurance': {'min': 12, 'max': 20}
        }

    def generate_workout(self, muscles_targeted, duration, intensity, goal, equipment):
        """
        Generate a complete workout plan

        Args:
            muscles_targeted: List of muscle groups to target
            duration: Workout duration in minutes
            intensity: 'light', 'moderate', or 'intense'
            goal: 'strength', 'hypertrophy', or 'endurance'
            equipment: 'bodyweight', 'home', or 'gym'

        Returns:
            dict: Complete workout plan with exercises
        """
        # Filter exercises based on equipment
        available_exercises = self._filter_by_equipment(equipment)

        # Get exercises for each muscle group
        selected_exercises = []
        for muscle in muscles_targeted:
            muscle_exercises = available_exercises.filter(primary_muscle=muscle)
            if muscle_exercises.exists():
                # Select 2-3 exercises per muscle group
                count = min(3, muscle_exercises.count())
                exercises = random.sample(list(muscle_exercises), count)
                selected_exercises.extend(exercises)

        # If we don't have enough exercises, add some compound movements
        if len(selected_exercises) < 3:
            compound_exercises = available_exercises.filter(
                secondary_muscles__len__gt=0
            )
            if compound_exercises.exists():
                additional = random.sample(
                    list(compound_exercises),
                    min(3 - len(selected_exercises), compound_exercises.count())
                )
                selected_exercises.extend(additional)

        # Calculate time per exercise
        time_per_exercise = duration / len(selected_exercises) if selected_exercises else 0

        # Build workout plan
        workout_exercises = []
        for exercise in selected_exercises:
            exercise_data = self._build_exercise_data(
                exercise, intensity, goal, time_per_exercise
            )
            workout_exercises.append(exercise_data)

        return {
            'exercises': workout_exercises,
            'total_exercises': len(workout_exercises),
            'estimated_duration': duration,
            'muscles_targeted': muscles_targeted,
            'intensity': intensity,
            'goal': goal,
            'equipment': equipment,
            'warmup_recommendation': self._get_warmup_recommendation(intensity),
            'cooldown_recommendation': self._get_cooldown_recommendation()
        }

    def _filter_by_equipment(self, equipment):
        """Filter exercises by available equipment"""
        if equipment == 'bodyweight':
            return Exercise.objects.filter(equipment='bodyweight')
        elif equipment == 'home':
            return Exercise.objects.filter(
                equipment__in=['bodyweight', 'dumbbells', 'resistance_band', 'kettlebell']
            )
        else:  # gym
            return Exercise.objects.all()

    def _build_exercise_data(self, exercise, intensity, goal, time_per_exercise):
        """Build detailed exercise data with sets, reps, rest"""
        # Get base values
        sets = exercise.sets_min
        reps_min = self.goal_reps[goal]['min']
        reps_max = self.goal_reps[goal]['max']
        rest = exercise.rest_seconds

        # Apply intensity multipliers
        multiplier = self.intensity_multipliers[intensity]
        sets = max(1, int(sets * multiplier['sets']))
        rest = int(rest * multiplier['rest'])

        return {
            'id': exercise.id,
            'name': exercise.name,
            'primary_muscle': exercise.primary_muscle,
            'secondary_muscles': exercise.secondary_muscles,
            'equipment': exercise.equipment,
            'difficulty': exercise.difficulty,
            'sets': sets,
            'reps': f"{reps_min}-{reps_max}",
            'rest_seconds': rest,
            'description': exercise.description,
            'instructions': exercise.instructions,
            'tips': exercise.tips,
            'image_url': exercise.image_url or '',
            'gif_url': exercise.gif_url or '',
            'video_url': exercise.video_url or ''
        }

    def _get_warmup_recommendation(self, intensity):
        """Get warmup recommendation based on intensity"""
        warmup_times = {
            'light': 5,
            'moderate': 7,
            'intense': 10
        }
        return {
            'duration': warmup_times[intensity],
            'activities': [
                'Light cardio (jogging, jumping jacks)',
                'Dynamic stretching',
                'Mobility exercises for target muscles'
            ]
        }

    def _get_cooldown_recommendation(self):
        """Get cooldown recommendation"""
        return {
            'duration': 5,
            'activities': [
                'Light cardio (walking)',
                'Static stretching',
                'Deep breathing exercises'
            ]
        }
