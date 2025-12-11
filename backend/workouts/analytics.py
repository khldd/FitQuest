"""
Analytics service for workout data aggregation and analysis.
"""
from django.db.models import Count, Sum, Avg, Max, Q
from django.utils import timezone
from datetime import datetime, timedelta
from collections import defaultdict
from .models import WorkoutHistory


class WorkoutAnalyticsService:
    """Service class for workout analytics calculations"""

    @staticmethod
    def parse_period(period_str, start_date=None, end_date=None):
        """
        Parse period string or date range into start and end dates.

        Args:
            period_str: String like '7d', '30d', '90d', or 'all'
            start_date: Optional start date string (YYYY-MM-DD)
            end_date: Optional end date string (YYYY-MM-DD)

        Returns:
            tuple: (start_date, end_date, label)
        """
        today = timezone.now().date()

        # If custom date range provided, use that
        if start_date and end_date:
            start = datetime.strptime(start_date, '%Y-%m-%d').date()
            end = datetime.strptime(end_date, '%Y-%m-%d').date()
            label = f"{start.strftime('%b %d, %Y')} - {end.strftime('%b %d, %Y')}"
            return start, end, label

        # Parse period string
        period_map = {
            '7d': (today - timedelta(days=7), today, 'Last 7 days'),
            '30d': (today - timedelta(days=30), today, 'Last 30 days'),
            '90d': (today - timedelta(days=90), today, 'Last 90 days'),
            'all': (None, today, 'All time')
        }

        return period_map.get(period_str, period_map['30d'])

    @staticmethod
    def get_summary(user, start_date=None, end_date=None):
        """
        Get summary analytics for user's workouts.

        Args:
            user: User instance
            start_date: Start date for analysis (date object)
            end_date: End date for analysis (date object)

        Returns:
            dict: Summary statistics
        """
        # Base queryset
        workouts = WorkoutHistory.objects.filter(user=user)

        # Apply date filters
        if start_date:
            workouts = workouts.filter(workout_date__gte=start_date)
        if end_date:
            workouts = workouts.filter(workout_date__lte=end_date)

        # Calculate metrics
        total_workouts = workouts.count()

        if total_workouts == 0:
            return {
                'metrics': {
                    'total_workouts': 0,
                    'total_duration': 0,
                    'total_points': 0,
                    'avg_duration': 0,
                    'avg_intensity_score': 0,
                    'completion_rate': 100.0
                },
                'intensity_breakdown': {'light': 0, 'moderate': 0, 'intense': 0},
                'goal_breakdown': {},
                'equipment_breakdown': {}
            }

        aggregates = workouts.aggregate(
            total_duration=Sum('duration'),
            total_points=Sum('points_earned'),
            avg_duration=Avg('duration')
        )

        # Calculate average intensity score
        intensity_scores = {'light': 1.0, 'moderate': 1.5, 'intense': 2.0}
        intensity_sum = sum(
            intensity_scores.get(w.intensity, 1.0)
            for w in workouts
        )
        avg_intensity = intensity_sum / total_workouts if total_workouts > 0 else 0

        # Breakdown by intensity
        intensity_breakdown = {
            'light': workouts.filter(intensity='light').count(),
            'moderate': workouts.filter(intensity='moderate').count(),
            'intense': workouts.filter(intensity='intense').count()
        }

        # Breakdown by goal
        goal_counts = workouts.values('goal').annotate(count=Count('id'))
        goal_breakdown = {item['goal']: item['count'] for item in goal_counts if item['goal']}

        # Breakdown by equipment
        equipment_counts = workouts.values('equipment').annotate(count=Count('id'))
        equipment_breakdown = {item['equipment']: item['count'] for item in equipment_counts}

        return {
            'metrics': {
                'total_workouts': total_workouts,
                'total_duration': aggregates['total_duration'] or 0,
                'total_points': aggregates['total_points'] or 0,
                'avg_duration': round(aggregates['avg_duration'] or 0, 1),
                'avg_intensity_score': round(avg_intensity, 2),
                'completion_rate': 100.0  # Assuming all logged workouts are completed
            },
            'intensity_breakdown': intensity_breakdown,
            'goal_breakdown': goal_breakdown,
            'equipment_breakdown': equipment_breakdown
        }

    @staticmethod
    def get_trends(user, start_date=None, end_date=None, granularity='daily'):
        """
        Get time-series trends for workouts.

        Args:
            user: User instance
            start_date: Start date (date object)
            end_date: End date (date object)
            granularity: 'daily', 'weekly', or 'monthly'

        Returns:
            dict: Trends data with granularity and data points
        """
        # Base queryset
        workouts = WorkoutHistory.objects.filter(user=user)

        # Apply date filters
        if start_date:
            workouts = workouts.filter(workout_date__gte=start_date)
        if end_date:
            workouts = workouts.filter(workout_date__lte=end_date)

        # Group by date
        if granularity == 'daily':
            grouped = workouts.values('workout_date').annotate(
                workouts=Count('id'),
                duration=Sum('duration'),
                points=Sum('points_earned')
            ).order_by('workout_date')

            # Calculate avg intensity for each date
            data_points = []
            for group in grouped:
                date_workouts = workouts.filter(workout_date=group['workout_date'])
                intensity_scores = {'light': 1.0, 'moderate': 1.5, 'intense': 2.0}
                intensity_sum = sum(
                    intensity_scores.get(w.intensity, 1.0)
                    for w in date_workouts
                )
                avg_intensity = intensity_sum / group['workouts'] if group['workouts'] > 0 else 0

                data_points.append({
                    'date': group['workout_date'].strftime('%Y-%m-%d'),
                    'workouts': group['workouts'],
                    'duration': group['duration'] or 0,
                    'points': group['points'] or 0,
                    'avg_intensity': round(avg_intensity, 2)
                })

            return {
                'granularity': 'daily',
                'data': data_points
            }

        # For weekly/monthly, we'd implement similar logic with date truncation
        # For MVP, focusing on daily granularity
        return {
            'granularity': granularity,
            'data': []
        }

    @staticmethod
    def get_muscle_analytics(user, start_date=None, end_date=None, top_n=10):
        """
        Get muscle group frequency analysis.

        Args:
            user: User instance
            start_date: Start date (date object)
            end_date: End date (date object)
            top_n: Number of top muscles to return

        Returns:
            dict: Muscle frequency data
        """
        # Base queryset
        workouts = WorkoutHistory.objects.filter(user=user)

        # Apply date filters
        if start_date:
            workouts = workouts.filter(workout_date__gte=start_date)
        if end_date:
            workouts = workouts.filter(workout_date__lte=end_date)

        # Parse muscles_targeted JSON field
        muscle_counts = defaultdict(int)
        muscle_durations = defaultdict(int)

        for workout in workouts:
            if workout.muscles_targeted:
                muscles = workout.muscles_targeted if isinstance(workout.muscles_targeted, list) else []
                for muscle in muscles:
                    # Normalize muscle name (capitalize first letter)
                    muscle_name = muscle.strip().capitalize()
                    muscle_counts[muscle_name] += 1
                    muscle_durations[muscle_name] += workout.duration

        # Calculate total workouts for percentage
        total_workouts = workouts.count()

        # Convert to list and sort by count
        muscle_frequency = []
        for muscle, count in sorted(muscle_counts.items(), key=lambda x: x[1], reverse=True)[:top_n]:
            percentage = (count / total_workouts * 100) if total_workouts > 0 else 0
            muscle_frequency.append({
                'muscle': muscle,
                'count': count,
                'total_duration': muscle_durations[muscle],
                'percentage': round(percentage, 1)
            })

        return {
            'muscle_frequency': muscle_frequency,
            'muscle_pairs': []  # Can implement common muscle combinations later
        }

    @staticmethod
    def get_consistency(user, start_date=None, end_date=None):
        """
        Get consistency metrics including calendar data and day-of-week breakdown.

        Args:
            user: User instance
            start_date: Start date (date object)
            end_date: End date (date object)

        Returns:
            dict: Consistency data
        """
        # Get user profile for streak info
        profile = user.userprofile if hasattr(user, 'userprofile') else None

        # Base queryset
        workouts = WorkoutHistory.objects.filter(user=user)

        # Apply date filters
        if start_date:
            workouts = workouts.filter(workout_date__gte=start_date)
        if end_date:
            workouts = workouts.filter(workout_date__lte=end_date)

        # Generate calendar data
        workout_calendar = []
        if start_date and end_date:
            current_date = start_date
            while current_date <= end_date:
                date_workouts = workouts.filter(workout_date=current_date)
                workout_count = date_workouts.count()
                total_points = date_workouts.aggregate(Sum('points_earned'))['points_earned__sum'] or 0

                workout_calendar.append({
                    'date': current_date.strftime('%Y-%m-%d'),
                    'has_workout': workout_count > 0,
                    'workout_count': workout_count,
                    'total_points': total_points
                })
                current_date += timedelta(days=1)

        # Day of week breakdown
        day_of_week_breakdown = {
            'Monday': 0,
            'Tuesday': 0,
            'Wednesday': 0,
            'Thursday': 0,
            'Friday': 0,
            'Saturday': 0,
            'Sunday': 0
        }

        for workout in workouts:
            day_name = workout.workout_date.strftime('%A')
            day_of_week_breakdown[day_name] += 1

        # Calculate weekly consistency
        total_workouts = workouts.count()
        weeks_in_period = ((end_date - start_date).days // 7) if start_date and end_date else 1
        avg_per_week = total_workouts / weeks_in_period if weeks_in_period > 0 else 0

        return {
            'current_streak': profile.current_streak if profile else 0,
            'longest_streak': profile.longest_streak if profile else 0,
            'workout_calendar': workout_calendar,
            'weekly_consistency': {
                'target_workouts_per_week': 4,  # Default target
                'actual_avg_per_week': round(avg_per_week, 1),
                'achievement_rate': round((avg_per_week / 4 * 100), 1) if avg_per_week > 0 else 0,
                'weeks_on_target': sum(1 for _ in range(weeks_in_period) if avg_per_week >= 4),
                'total_weeks': weeks_in_period
            },
            'day_of_week_breakdown': day_of_week_breakdown
        }

    @staticmethod
    def get_records(user):
        """
        Get personal records and milestones.

        Args:
            user: User instance

        Returns:
            dict: Personal records data
        """
        workouts = WorkoutHistory.objects.filter(user=user)

        if workouts.count() == 0:
            return {
                'records': {},
                'recent_milestones': []
            }

        # Find records
        longest_workout = workouts.order_by('-duration').first()
        highest_points = workouts.order_by('-points_earned').first()

        # Most exercises (parse exercises_completed JSON)
        most_exercises_workout = None
        max_exercise_count = 0
        for workout in workouts:
            if workout.exercises_completed:
                exercise_count = len(workout.exercises_completed) if isinstance(workout.exercises_completed, list) else 0
                if exercise_count > max_exercise_count:
                    max_exercise_count = exercise_count
                    most_exercises_workout = workout

        records = {}

        if longest_workout:
            records['longest_workout'] = {
                'duration': longest_workout.duration,
                'date': longest_workout.workout_date.strftime('%Y-%m-%d'),
                'workout_id': longest_workout.id
            }

        if highest_points:
            records['highest_points'] = {
                'points': highest_points.points_earned,
                'date': highest_points.workout_date.strftime('%Y-%m-%d'),
                'workout_id': highest_points.id
            }

        if most_exercises_workout:
            records['most_exercises'] = {
                'count': max_exercise_count,
                'date': most_exercises_workout.workout_date.strftime('%Y-%m-%d'),
                'workout_id': most_exercises_workout.id
            }

        # Calculate milestones
        profile = user.userprofile if hasattr(user, 'userprofile') else None
        milestones = []

        if profile:
            # Check for workout count milestones
            workout_milestones = [10, 25, 50, 100, 250, 500]
            for milestone in workout_milestones:
                if profile.total_workouts >= milestone:
                    # Find the workout that reached this milestone
                    milestone_workout = workouts.order_by('workout_date')[milestone - 1] if workouts.count() >= milestone else None
                    if milestone_workout:
                        milestones.append({
                            'type': 'total_workouts',
                            'value': milestone,
                            'achieved_date': milestone_workout.workout_date.strftime('%Y-%m-%d')
                        })

            # Check for points milestones
            points_milestones = [1000, 2500, 5000, 10000]
            for milestone in points_milestones:
                if profile.total_points >= milestone:
                    milestones.append({
                        'type': 'total_points',
                        'value': milestone,
                        'achieved_date': timezone.now().date().strftime('%Y-%m-%d')  # Approximate
                    })

        # Return most recent 5 milestones
        milestones = sorted(milestones, key=lambda x: x['achieved_date'], reverse=True)[:5]

        return {
            'records': records,
            'recent_milestones': milestones
        }
