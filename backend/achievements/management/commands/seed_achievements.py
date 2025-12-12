from django.core.management.base import BaseCommand
from achievements.models import Achievement


class Command(BaseCommand):
    help = 'Seed initial achievements into the database'

    def handle(self, *args, **kwargs):
        achievements = [
            # Consistency - Bronze
            {
                'name': 'First Step',
                'description': 'Complete your first workout',
                'category': 'consistency',
                'tier': 'bronze',
                'icon': '🎯',
                'color': 'orange',
                'requirement_type': 'total_workouts',
                'requirement_value': 1,
                'points': 10
            },
            {
                'name': 'Getting Started',
                'description': 'Complete 5 workouts',
                'category': 'consistency',
                'tier': 'bronze',
                'icon': '💪',
                'color': 'orange',
                'requirement_type': 'total_workouts',
                'requirement_value': 5,
                'points': 25
            },
            {
                'name': 'Building Momentum',
                'description': 'Complete 10 workouts',
                'category': 'consistency',
                'tier': 'bronze',
                'icon': '🚀',
                'color': 'orange',
                'requirement_type': 'total_workouts',
                'requirement_value': 10,
                'points': 50
            },
            
            # Consistency - Silver
            {
                'name': 'Dedicated Athlete',
                'description': 'Complete 25 workouts',
                'category': 'consistency',
                'tier': 'silver',
                'icon': '⭐',
                'color': 'gray',
                'requirement_type': 'total_workouts',
                'requirement_value': 25,
                'points': 100
            },
            {
                'name': 'Fitness Enthusiast',
                'description': 'Complete 50 workouts',
                'category': 'consistency',
                'tier': 'silver',
                'icon': '🌟',
                'color': 'gray',
                'requirement_type': 'total_workouts',
                'requirement_value': 50,
                'points': 200
            },
            
            # Consistency - Gold
            {
                'name': 'Fitness Master',
                'description': 'Complete 100 workouts',
                'category': 'consistency',
                'tier': 'gold',
                'icon': '👑',
                'color': 'yellow',
                'requirement_type': 'total_workouts',
                'requirement_value': 100,
                'points': 500
            },
            {
                'name': 'Century Club',
                'description': 'Complete 150 workouts',
                'category': 'consistency',
                'tier': 'gold',
                'icon': '💯',
                'color': 'yellow',
                'requirement_type': 'total_workouts',
                'requirement_value': 150,
                'points': 750
            },
            
            # Consistency - Platinum
            {
                'name': 'Legendary Athlete',
                'description': 'Complete 200 workouts',
                'category': 'consistency',
                'tier': 'platinum',
                'icon': '🏆',
                'color': 'cyan',
                'requirement_type': 'total_workouts',
                'requirement_value': 200,
                'points': 1000
            },
            
            # Streak - Bronze
            {
                'name': 'Hot Start',
                'description': 'Maintain a 3-day workout streak',
                'category': 'streak',
                'tier': 'bronze',
                'icon': '🔥',
                'color': 'orange',
                'requirement_type': 'current_streak',
                'requirement_value': 3,
                'points': 30
            },
            {
                'name': 'Week Warrior',
                'description': 'Maintain a 7-day workout streak',
                'category': 'streak',
                'tier': 'bronze',
                'icon': '📅',
                'color': 'orange',
                'requirement_type': 'current_streak',
                'requirement_value': 7,
                'points': 70
            },
            
            # Streak - Silver
            {
                'name': 'Fortnight Fighter',
                'description': 'Maintain a 14-day workout streak',
                'category': 'streak',
                'tier': 'silver',
                'icon': '⚡',
                'color': 'gray',
                'requirement_type': 'current_streak',
                'requirement_value': 14,
                'points': 150
            },
            {
                'name': 'Monthly Master',
                'description': 'Maintain a 30-day workout streak',
                'category': 'streak',
                'tier': 'silver',
                'icon': '🎖️',
                'color': 'gray',
                'requirement_type': 'current_streak',
                'requirement_value': 30,
                'points': 300
            },
            
            # Streak - Gold
            {
                'name': 'Unstoppable',
                'description': 'Maintain a 60-day workout streak',
                'category': 'streak',
                'tier': 'gold',
                'icon': '🔱',
                'color': 'yellow',
                'requirement_type': 'current_streak',
                'requirement_value': 60,
                'points': 600
            },
            {
                'name': '100 Days Strong',
                'description': 'Maintain a 100-day workout streak',
                'category': 'streak',
                'tier': 'gold',
                'icon': '💎',
                'color': 'yellow',
                'requirement_type': 'current_streak',
                'requirement_value': 100,
                'points': 1000
            },
            
            # Streak - Platinum
            {
                'name': 'Iron Will',
                'description': 'Maintain a 365-day workout streak',
                'category': 'streak',
                'tier': 'platinum',
                'icon': '🏅',
                'color': 'cyan',
                'requirement_type': 'current_streak',
                'requirement_value': 365,
                'points': 3650
            },
            
            # Intensity - Bronze
            {
                'name': 'Intensity Beginner',
                'description': 'Complete 5 intense workouts',
                'category': 'intensity',
                'tier': 'bronze',
                'icon': '💥',
                'color': 'orange',
                'requirement_type': 'intense_workouts',
                'requirement_value': 5,
                'points': 50
            },
            {
                'name': 'Going Hard',
                'description': 'Complete 10 intense workouts',
                'category': 'intensity',
                'tier': 'bronze',
                'icon': '⚔️',
                'color': 'orange',
                'requirement_type': 'intense_workouts',
                'requirement_value': 10,
                'points': 100
            },
            
            # Intensity - Silver
            {
                'name': 'Beast Mode',
                'description': 'Complete 25 intense workouts',
                'category': 'intensity',
                'tier': 'silver',
                'icon': '🦁',
                'color': 'gray',
                'requirement_type': 'intense_workouts',
                'requirement_value': 25,
                'points': 250
            },
            {
                'name': 'No Pain No Gain',
                'description': 'Complete 50 intense workouts',
                'category': 'intensity',
                'tier': 'silver',
                'icon': '🔨',
                'color': 'gray',
                'requirement_type': 'intense_workouts',
                'requirement_value': 50,
                'points': 500
            },
            
            # Intensity - Gold
            {
                'name': 'Intensity Junkie',
                'description': 'Complete 100 intense workouts',
                'category': 'intensity',
                'tier': 'gold',
                'icon': '⚡',
                'color': 'yellow',
                'requirement_type': 'intense_workouts',
                'requirement_value': 100,
                'points': 1000
            },
            
            # Duration - Bronze
            {
                'name': 'Time Investor',
                'description': 'Complete 300 minutes of workouts',
                'category': 'duration',
                'tier': 'bronze',
                'icon': '⏱️',
                'color': 'orange',
                'requirement_type': 'total_duration',
                'requirement_value': 300,
                'points': 50
            },
            {
                'name': '10 Hours Strong',
                'description': 'Complete 600 minutes (10 hours) of workouts',
                'category': 'duration',
                'tier': 'bronze',
                'icon': '⏳',
                'color': 'orange',
                'requirement_type': 'total_duration',
                'requirement_value': 600,
                'points': 100
            },
            
            # Duration - Silver
            {
                'name': 'Marathon Trainer',
                'description': 'Complete 1200 minutes (20 hours) of workouts',
                'category': 'duration',
                'tier': 'silver',
                'icon': '🏃',
                'color': 'gray',
                'requirement_type': 'total_duration',
                'requirement_value': 1200,
                'points': 200
            },
            {
                'name': 'Endurance King',
                'description': 'Complete 3000 minutes (50 hours) of workouts',
                'category': 'duration',
                'tier': 'silver',
                'icon': '🎯',
                'color': 'gray',
                'requirement_type': 'total_duration',
                'requirement_value': 3000,
                'points': 500
            },
            
            # Duration - Gold
            {
                'name': '100 Hour Club',
                'description': 'Complete 6000 minutes (100 hours) of workouts',
                'category': 'duration',
                'tier': 'gold',
                'icon': '🌟',
                'color': 'yellow',
                'requirement_type': 'total_duration',
                'requirement_value': 6000,
                'points': 1000
            },
        ]

        created_count = 0
        updated_count = 0

        for ach_data in achievements:
            achievement, created = Achievement.objects.get_or_create(
                name=ach_data['name'],
                defaults=ach_data
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Created: {achievement.name} ({achievement.tier})')
                )
            else:
                # Update existing achievement
                for key, value in ach_data.items():
                    setattr(achievement, key, value)
                achievement.save()
                updated_count += 1
                self.stdout.write(
                    self.style.WARNING(f'↻ Updated: {achievement.name} ({achievement.tier})')
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'\n✅ Seeding complete! Created: {created_count}, Updated: {updated_count}'
            )
        )
