"""
Django management command to load workout presets
"""
from django.core.management.base import BaseCommand
from exercises.models import WorkoutPreset


class Command(BaseCommand):
    help = 'Load workout presets into Django'

    def handle(self, *args, **options):
        presets_data = self.get_presets_data()

        WorkoutPreset.objects.all().delete()
        self.stdout.write('Deleted existing presets')

        created_count = 0
        for preset_data in presets_data:
            try:
                WorkoutPreset.objects.create(**preset_data)
                created_count += 1
                self.stdout.write(f'Created: {preset_data["name"]}')
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'Error creating {preset_data.get("name", "unknown")}: {str(e)}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully loaded {created_count} presets')
        )

    def get_presets_data(self):
        """Return list of all workout presets"""
        return [
            {
                'name': 'Push Day',
                'description': 'Focus on pushing movements - chest, shoulders, and triceps. Perfect for building upper body pressing strength.',
                'muscle_groups': ['chest', 'shoulders', 'triceps'],
                'recommended_level': 'intermediate'
            },
            {
                'name': 'Pull Day',
                'description': 'Focus on pulling movements - back and biceps. Build a strong, wide back and powerful arms.',
                'muscle_groups': ['back', 'biceps'],
                'recommended_level': 'intermediate'
            },
            {
                'name': 'Leg Day',
                'description': 'Complete lower body workout targeting quads, hamstrings, glutes, and calves. Never skip leg day!',
                'muscle_groups': ['quads', 'hamstrings', 'glutes', 'calves'],
                'recommended_level': 'intermediate'
            },
            {
                'name': 'Full Body',
                'description': 'Comprehensive workout hitting all major muscle groups in one session. Ideal for beginners or time-efficient training.',
                'muscle_groups': ['chest', 'back', 'shoulders', 'quads', 'hamstrings', 'abs'],
                'recommended_level': 'beginner'
            },
            {
                'name': 'Upper Body',
                'description': 'Complete upper body workout combining both push and pull movements for balanced development.',
                'muscle_groups': ['chest', 'back', 'shoulders', 'biceps', 'triceps'],
                'recommended_level': 'intermediate'
            },
            {
                'name': 'Core & Abs',
                'description': 'Dedicated core workout focusing on abs, obliques, and overall core stability.',
                'muscle_groups': ['abs', 'obliques'],
                'recommended_level': 'beginner'
            },
            {
                'name': 'Arms Blaster',
                'description': 'High-volume arm workout targeting biceps and triceps for maximum pump.',
                'muscle_groups': ['biceps', 'triceps'],
                'recommended_level': 'intermediate'
            },
        ]
