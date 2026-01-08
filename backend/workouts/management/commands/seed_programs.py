from django.core.management.base import BaseCommand
from workouts.models import WorkoutProgram, ProgramDay


class Command(BaseCommand):
    help = 'Seed preset workout programs'

    def handle(self, *args, **options):
        self.stdout.write('Seeding workout programs...')
        
        programs_data = [
            # 4-Week Beginner Full Body
            {
                'name': '4-Week Beginner Full Body',
                'description': 'Perfect for fitness beginners! This program introduces you to all major muscle groups with manageable workouts. Build a solid foundation with proper form and progressive intensity.',
                'weeks': 4,
                'days_per_week': 3,
                'difficulty': 'beginner',
                'goal': 'general_fitness',
                'icon': '🌱',
                'color': 'green',
                'estimated_duration_per_session': 30,
                'equipment_needed': 'bodyweight',
                'is_featured': True,
                'days': [
                    # Week 1
                    {'week': 1, 'day': 1, 'name': 'Full Body A', 'muscles': ['chest', 'back', 'quadriceps'], 'duration': 30, 'intensity': 'light'},
                    {'week': 1, 'day': 2, 'name': 'Full Body B', 'muscles': ['shoulders', 'biceps', 'triceps'], 'duration': 30, 'intensity': 'light'},
                    {'week': 1, 'day': 3, 'name': 'Full Body C', 'muscles': ['glutes', 'hamstrings', 'core'], 'duration': 30, 'intensity': 'light'},
                    # Week 2
                    {'week': 2, 'day': 1, 'name': 'Full Body A', 'muscles': ['chest', 'back', 'quadriceps'], 'duration': 35, 'intensity': 'light'},
                    {'week': 2, 'day': 2, 'name': 'Full Body B', 'muscles': ['shoulders', 'biceps', 'triceps'], 'duration': 35, 'intensity': 'light'},
                    {'week': 2, 'day': 3, 'name': 'Full Body C', 'muscles': ['glutes', 'hamstrings', 'core'], 'duration': 35, 'intensity': 'light'},
                    # Week 3
                    {'week': 3, 'day': 1, 'name': 'Full Body A', 'muscles': ['chest', 'back', 'quadriceps'], 'duration': 35, 'intensity': 'moderate'},
                    {'week': 3, 'day': 2, 'name': 'Full Body B', 'muscles': ['shoulders', 'biceps', 'triceps'], 'duration': 35, 'intensity': 'moderate'},
                    {'week': 3, 'day': 3, 'name': 'Full Body C', 'muscles': ['glutes', 'hamstrings', 'core'], 'duration': 35, 'intensity': 'moderate'},
                    # Week 4
                    {'week': 4, 'day': 1, 'name': 'Full Body A', 'muscles': ['chest', 'back', 'quadriceps'], 'duration': 40, 'intensity': 'moderate'},
                    {'week': 4, 'day': 2, 'name': 'Full Body B', 'muscles': ['shoulders', 'biceps', 'triceps'], 'duration': 40, 'intensity': 'moderate'},
                    {'week': 4, 'day': 3, 'name': 'Full Body C', 'muscles': ['glutes', 'hamstrings', 'core'], 'duration': 40, 'intensity': 'moderate'},
                ]
            },
            # 6-Week Strength Builder
            {
                'name': '6-Week Strength Builder',
                'description': 'Build serious strength with this progressive overload program. Focus on compound movements and increasing weights each week. Ideal for intermediate lifters.',
                'weeks': 6,
                'days_per_week': 4,
                'difficulty': 'intermediate',
                'goal': 'strength',
                'icon': '💪',
                'color': 'red',
                'estimated_duration_per_session': 50,
                'equipment_needed': 'gym',
                'is_featured': True,
                'days': self._generate_push_pull_legs_days(6, 4)
            },
            # 8-Week Hypertrophy Program
            {
                'name': '8-Week Muscle Builder',
                'description': 'Maximize muscle growth with high-volume training. This program uses proven hypertrophy techniques including supersets, drop sets, and time under tension.',
                'weeks': 8,
                'days_per_week': 5,
                'difficulty': 'intermediate',
                'goal': 'hypertrophy',
                'icon': '🏋️',
                'color': 'purple',
                'estimated_duration_per_session': 60,
                'equipment_needed': 'gym',
                'is_featured': True,
                'days': self._generate_bro_split_days(8, 5)
            },
            # 4-Week Fat Burner
            {
                'name': '4-Week Fat Burner',
                'description': 'High-intensity program designed to torch calories and boost metabolism. Combines strength training with cardio elements for maximum fat loss.',
                'weeks': 4,
                'days_per_week': 4,
                'difficulty': 'intermediate',
                'goal': 'weight_loss',
                'icon': '🔥',
                'color': 'orange',
                'estimated_duration_per_session': 45,
                'equipment_needed': 'home',
                'is_featured': False,
                'days': self._generate_hiit_days(4, 4)
            },
            # 12-Week Transformation
            {
                'name': '12-Week Total Transformation',
                'description': 'Complete body transformation program. Starts with building a foundation, progresses to strength, and finishes with muscle definition. The ultimate fitness journey.',
                'weeks': 12,
                'days_per_week': 5,
                'difficulty': 'advanced',
                'goal': 'general_fitness',
                'icon': '⚡',
                'color': 'blue',
                'estimated_duration_per_session': 60,
                'equipment_needed': 'gym',
                'is_featured': True,
                'days': self._generate_transformation_days(12, 5)
            },
            # 6-Week Home Workout
            {
                'name': '6-Week Home Warrior',
                'description': 'No gym? No problem! Build strength and endurance with this bodyweight-focused program. Perfect for those who prefer working out at home.',
                'weeks': 6,
                'days_per_week': 4,
                'difficulty': 'beginner',
                'goal': 'general_fitness',
                'icon': '🏠',
                'color': 'teal',
                'estimated_duration_per_session': 35,
                'equipment_needed': 'bodyweight',
                'is_featured': False,
                'days': self._generate_home_days(6, 4)
            },
        ]

        for program_data in programs_data:
            days_data = program_data.pop('days')
            
            program, created = WorkoutProgram.objects.update_or_create(
                name=program_data['name'],
                defaults=program_data
            )
            
            if created:
                self.stdout.write(f'  Created program: {program.name}')
            else:
                self.stdout.write(f'  Updated program: {program.name}')
                # Clear existing days
                program.program_days.all().delete()
            
            # Create program days
            for day_data in days_data:
                ProgramDay.objects.create(
                    program=program,
                    week_number=day_data['week'],
                    day_number=day_data['day'],
                    name=day_data['name'],
                    description=day_data.get('description', ''),
                    muscles_targeted=day_data['muscles'],
                    duration=day_data['duration'],
                    intensity=day_data['intensity'],
                    is_rest_day=day_data.get('is_rest', False)
                )

        self.stdout.write(self.style.SUCCESS(f'Successfully seeded {len(programs_data)} programs!'))

    def _generate_push_pull_legs_days(self, weeks, days_per_week):
        """Generate Push/Pull/Legs/Upper split days"""
        days = []
        day_templates = [
            {'name': 'Push Day', 'muscles': ['chest', 'shoulders', 'triceps']},
            {'name': 'Pull Day', 'muscles': ['back', 'biceps', 'forearms']},
            {'name': 'Leg Day', 'muscles': ['quadriceps', 'hamstrings', 'glutes', 'calves']},
            {'name': 'Upper Body', 'muscles': ['chest', 'back', 'shoulders']},
        ]
        
        for week in range(1, weeks + 1):
            base_duration = 45 + (week // 2) * 5
            intensity = 'moderate' if week <= 3 else 'intense'
            
            for day in range(1, days_per_week + 1):
                template = day_templates[(day - 1) % len(day_templates)]
                days.append({
                    'week': week,
                    'day': day,
                    'name': template['name'],
                    'muscles': template['muscles'],
                    'duration': min(base_duration, 60),
                    'intensity': intensity
                })
        return days

    def _generate_bro_split_days(self, weeks, days_per_week):
        """Generate classic bodybuilding split"""
        days = []
        day_templates = [
            {'name': 'Chest Day', 'muscles': ['chest', 'triceps']},
            {'name': 'Back Day', 'muscles': ['back', 'biceps']},
            {'name': 'Shoulder Day', 'muscles': ['shoulders', 'traps']},
            {'name': 'Leg Day', 'muscles': ['quadriceps', 'hamstrings', 'glutes', 'calves']},
            {'name': 'Arms Day', 'muscles': ['biceps', 'triceps', 'forearms']},
        ]
        
        for week in range(1, weeks + 1):
            base_duration = 50 + (week // 3) * 5
            intensity = 'moderate' if week <= 4 else 'intense'
            
            for day in range(1, days_per_week + 1):
                template = day_templates[(day - 1) % len(day_templates)]
                days.append({
                    'week': week,
                    'day': day,
                    'name': template['name'],
                    'muscles': template['muscles'],
                    'duration': min(base_duration, 65),
                    'intensity': intensity
                })
        return days

    def _generate_hiit_days(self, weeks, days_per_week):
        """Generate HIIT/fat loss program days"""
        days = []
        day_templates = [
            {'name': 'Full Body HIIT', 'muscles': ['chest', 'back', 'quadriceps', 'core']},
            {'name': 'Upper Body Burn', 'muscles': ['chest', 'shoulders', 'back', 'biceps', 'triceps']},
            {'name': 'Lower Body Blast', 'muscles': ['quadriceps', 'hamstrings', 'glutes', 'calves']},
            {'name': 'Core & Cardio', 'muscles': ['core', 'obliques']},
        ]
        
        for week in range(1, weeks + 1):
            base_duration = 40 + (week * 2)
            intensity = 'intense'
            
            for day in range(1, days_per_week + 1):
                template = day_templates[(day - 1) % len(day_templates)]
                days.append({
                    'week': week,
                    'day': day,
                    'name': template['name'],
                    'muscles': template['muscles'],
                    'duration': min(base_duration, 50),
                    'intensity': intensity
                })
        return days

    def _generate_transformation_days(self, weeks, days_per_week):
        """Generate 12-week transformation program"""
        days = []
        
        # Phase 1 (weeks 1-4): Foundation
        phase1_templates = [
            {'name': 'Full Body A', 'muscles': ['chest', 'back', 'quadriceps']},
            {'name': 'Full Body B', 'muscles': ['shoulders', 'hamstrings', 'core']},
            {'name': 'Upper Focus', 'muscles': ['chest', 'back', 'shoulders']},
            {'name': 'Lower Focus', 'muscles': ['quadriceps', 'hamstrings', 'glutes']},
            {'name': 'Active Recovery', 'muscles': ['core', 'glutes']},
        ]
        
        # Phase 2 (weeks 5-8): Strength
        phase2_templates = [
            {'name': 'Push Power', 'muscles': ['chest', 'shoulders', 'triceps']},
            {'name': 'Pull Power', 'muscles': ['back', 'biceps', 'forearms']},
            {'name': 'Leg Power', 'muscles': ['quadriceps', 'hamstrings', 'glutes', 'calves']},
            {'name': 'Upper Strength', 'muscles': ['chest', 'back', 'shoulders']},
            {'name': 'Full Body Strength', 'muscles': ['chest', 'back', 'quadriceps', 'core']},
        ]
        
        # Phase 3 (weeks 9-12): Definition
        phase3_templates = [
            {'name': 'Chest & Tris', 'muscles': ['chest', 'triceps']},
            {'name': 'Back & Bis', 'muscles': ['back', 'biceps']},
            {'name': 'Legs & Core', 'muscles': ['quadriceps', 'hamstrings', 'glutes', 'core']},
            {'name': 'Shoulders & Arms', 'muscles': ['shoulders', 'biceps', 'triceps']},
            {'name': 'HIIT Full Body', 'muscles': ['chest', 'back', 'quadriceps', 'core']},
        ]
        
        for week in range(1, weeks + 1):
            if week <= 4:
                templates = phase1_templates
                intensity = 'light' if week <= 2 else 'moderate'
                base_duration = 40
            elif week <= 8:
                templates = phase2_templates
                intensity = 'moderate' if week <= 6 else 'intense'
                base_duration = 50
            else:
                templates = phase3_templates
                intensity = 'intense'
                base_duration = 55
            
            for day in range(1, days_per_week + 1):
                template = templates[(day - 1) % len(templates)]
                days.append({
                    'week': week,
                    'day': day,
                    'name': template['name'],
                    'muscles': template['muscles'],
                    'duration': base_duration,
                    'intensity': intensity
                })
        return days

    def _generate_home_days(self, weeks, days_per_week):
        """Generate home workout program days"""
        days = []
        day_templates = [
            {'name': 'Upper Body', 'muscles': ['chest', 'shoulders', 'triceps', 'biceps']},
            {'name': 'Lower Body', 'muscles': ['quadriceps', 'hamstrings', 'glutes', 'calves']},
            {'name': 'Core & Cardio', 'muscles': ['core', 'obliques']},
            {'name': 'Full Body', 'muscles': ['chest', 'back', 'quadriceps', 'core']},
        ]
        
        for week in range(1, weeks + 1):
            base_duration = 30 + (week * 2)
            intensity = 'light' if week <= 2 else 'moderate'
            
            for day in range(1, days_per_week + 1):
                template = day_templates[(day - 1) % len(day_templates)]
                days.append({
                    'week': week,
                    'day': day,
                    'name': template['name'],
                    'muscles': template['muscles'],
                    'duration': min(base_duration, 45),
                    'intensity': intensity
                })
        return days
