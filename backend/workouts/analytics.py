"""
Analytics service for workout data aggregation and analysis.
Optimized with database-level aggregations for better performance.
"""
from django.db.models import Count, Sum, Avg, Max, Q, Case, When, Value, FloatField
from django.db.models.functions import ExtractWeekDay
from django.utils import timezone
from datetime import datetime, timedelta
from collections import defaultdict
from .models import WorkoutHistory


class WorkoutAnalyticsService:
    """Service class for workout analytics calculations"""

    # Class-level constants for intensity scoring
    INTENSITY_SCORES = {'light': 1.0, 'moderate': 1.5, 'intense': 2.0}

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

    @classmethod
    def _get_base_queryset(cls, user, start_date=None, end_date=None):
        """Helper to get filtered base queryset"""
        workouts = WorkoutHistory.objects.filter(user=user)
        if start_date:
            workouts = workouts.filter(workout_date__gte=start_date)
        if end_date:
            workouts = workouts.filter(workout_date__lte=end_date)
        return workouts

    @classmethod
    def get_summary(cls, user, start_date=None, end_date=None):
        """
        Get summary analytics for user's workouts.
        Optimized to use database aggregations instead of Python loops.

        Args:
            user: User instance
            start_date: Start date for analysis (date object)
            end_date: End date for analysis (date object)

        Returns:
            dict: Summary statistics
        """
        workouts = cls._get_base_queryset(user, start_date, end_date)

        # Single query with all aggregations including intensity scoring
        aggregates = workouts.aggregate(
            total_workouts=Count('id'),
            total_duration=Sum('duration'),
            total_points=Sum('points_earned'),
            avg_duration=Avg('duration'),
            # Calculate intensity counts in single query
            light_count=Count('id', filter=Q(intensity='light')),
            moderate_count=Count('id', filter=Q(intensity='moderate')),
            intense_count=Count('id', filter=Q(intensity='intense')),
            # Calculate weighted intensity score using Case/When at DB level
            intensity_score_sum=Sum(
                Case(
                    When(intensity='light', then=Value(1.0)),
                    When(intensity='moderate', then=Value(1.5)),
                    When(intensity='intense', then=Value(2.0)),
                    default=Value(1.0),
                    output_field=FloatField()
                )
            )
        )

        total_workouts = aggregates['total_workouts'] or 0

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

        # Calculate average intensity from pre-computed sum
        avg_intensity = (aggregates['intensity_score_sum'] or 0) / total_workouts

        # Breakdown by intensity from aggregates (no additional query)
        intensity_breakdown = {
            'light': aggregates['light_count'] or 0,
            'moderate': aggregates['moderate_count'] or 0,
            'intense': aggregates['intense_count'] or 0
        }

        # Breakdown by goal (single query)
        goal_counts = workouts.values('goal').annotate(count=Count('id'))
        goal_breakdown = {item['goal']: item['count'] for item in goal_counts if item['goal']}

        # Breakdown by equipment (single query)
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

    @classmethod
    def get_trends(cls, user, start_date=None, end_date=None, granularity='daily'):
        """
        Get time-series trends for workouts.
        Optimized with database-level intensity calculation.

        Args:
            user: User instance
            start_date: Start date (date object)
            end_date: End date (date object)
            granularity: 'daily', 'weekly', or 'monthly'

        Returns:
            dict: Trends data with granularity and data points
        """
        workouts = cls._get_base_queryset(user, start_date, end_date)

        # Group by date with all aggregations in a single query
        if granularity == 'daily':
            grouped = workouts.values('workout_date').annotate(
                workouts=Count('id'),
                duration=Sum('duration'),
                points=Sum('points_earned'),
                # Calculate intensity score sum at database level
                intensity_score_sum=Sum(
                    Case(
                        When(intensity='light', then=Value(1.0)),
                        When(intensity='moderate', then=Value(1.5)),
                        When(intensity='intense', then=Value(2.0)),
                        default=Value(1.0),
                        output_field=FloatField()
                    )
                )
            ).order_by('workout_date')

            # Build data points without additional queries
            data_points = [
                {
                    'date': group['workout_date'].strftime('%Y-%m-%d'),
                    'workouts': group['workouts'],
                    'duration': group['duration'] or 0,
                    'points': group['points'] or 0,
                    'avg_intensity': round(
                        (group['intensity_score_sum'] or 0) / group['workouts'], 2
                    ) if group['workouts'] > 0 else 0
                }
                for group in grouped
            ]

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

    @classmethod
    def get_muscle_analytics(cls, user, start_date=None, end_date=None, top_n=10):
        """
        Get muscle group frequency analysis.
        Note: JSON field parsing still requires Python-level processing,
        but we minimize queries by fetching only needed fields.

        Args:
            user: User instance
            start_date: Start date (date object)
            end_date: End date (date object)
            top_n: Number of top muscles to return

        Returns:
            dict: Muscle frequency data
        """
        workouts = cls._get_base_queryset(user, start_date, end_date)
        
        # Only fetch the fields we need
        workouts_data = workouts.values('muscles_targeted', 'duration')

        # Parse muscles_targeted JSON field
        muscle_counts = defaultdict(int)
        muscle_durations = defaultdict(int)
        total_workouts = 0

        for workout in workouts_data:
            total_workouts += 1
            muscles_targeted = workout['muscles_targeted']
            if muscles_targeted:
                muscles = muscles_targeted if isinstance(muscles_targeted, list) else []
                for muscle in muscles:
                    # Normalize muscle name (capitalize first letter)
                    muscle_name = muscle.strip().capitalize()
                    muscle_counts[muscle_name] += 1
                    muscle_durations[muscle_name] += workout['duration']

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

    @classmethod
    def get_consistency(cls, user, start_date=None, end_date=None):
        """
        Get consistency metrics including calendar data and day-of-week breakdown.
        Optimized with bulk calendar data fetching.

        Args:
            user: User instance
            start_date: Start date (date object)
            end_date: End date (date object)

        Returns:
            dict: Consistency data
        """
        # Get user profile for streak info
        profile = user.userprofile if hasattr(user, 'userprofile') else None

        workouts = cls._get_base_queryset(user, start_date, end_date)

        # Pre-aggregate calendar data in a single query
        calendar_data = {}
        if start_date and end_date:
            daily_stats = workouts.values('workout_date').annotate(
                workout_count=Count('id'),
                total_points=Sum('points_earned')
            )
            # Build lookup dict for O(1) access
            for stat in daily_stats:
                calendar_data[stat['workout_date']] = {
                    'workout_count': stat['workout_count'],
                    'total_points': stat['total_points'] or 0
                }

        # Generate calendar with pre-fetched data
        workout_calendar = []
        if start_date and end_date:
            current_date = start_date
            while current_date <= end_date:
                day_data = calendar_data.get(current_date, {'workout_count': 0, 'total_points': 0})
                workout_calendar.append({
                    'date': current_date.strftime('%Y-%m-%d'),
                    'has_workout': day_data['workout_count'] > 0,
                    'workout_count': day_data['workout_count'],
                    'total_points': day_data['total_points']
                })
                current_date += timedelta(days=1)

        # Day of week breakdown using database aggregation
        day_mapping = {1: 'Sunday', 2: 'Monday', 3: 'Tuesday', 4: 'Wednesday', 
                       5: 'Thursday', 6: 'Friday', 7: 'Saturday'}
        
        day_counts = workouts.annotate(
            weekday=ExtractWeekDay('workout_date')
        ).values('weekday').annotate(count=Count('id'))
        
        day_of_week_breakdown = {
            'Monday': 0, 'Tuesday': 0, 'Wednesday': 0, 'Thursday': 0,
            'Friday': 0, 'Saturday': 0, 'Sunday': 0
        }
        for item in day_counts:
            day_name = day_mapping.get(item['weekday'], 'Unknown')
            if day_name in day_of_week_breakdown:
                day_of_week_breakdown[day_name] = item['count']

        # Calculate weekly consistency
        total_workouts = workouts.count()
        weeks_in_period = ((end_date - start_date).days // 7) if start_date and end_date else 1
        weeks_in_period = max(weeks_in_period, 1)  # Avoid division by zero
        avg_per_week = total_workouts / weeks_in_period

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

    @classmethod
    def get_records(cls, user):
        """
        Get personal records and milestones.
        Optimized to minimize database queries.

        Args:
            user: User instance

        Returns:
            dict: Personal records data
        """
        workouts = WorkoutHistory.objects.filter(user=user)
        total_count = workouts.count()

        if total_count == 0:
            return {
                'records': {},
                'recent_milestones': []
            }

        # Get records in optimized queries
        longest_workout = workouts.order_by('-duration').values(
            'id', 'duration', 'workout_date'
        ).first()
        
        highest_points = workouts.order_by('-points_earned').values(
            'id', 'points_earned', 'workout_date'
        ).first()

        # For most exercises, we need to check JSON field length
        # Fetch only necessary fields to minimize data transfer
        workouts_with_exercises = workouts.exclude(
            exercises_completed__isnull=True
        ).values('id', 'exercises_completed', 'workout_date')
        
        most_exercises_workout = None
        max_exercise_count = 0
        for workout in workouts_with_exercises:
            exercises = workout['exercises_completed']
            if exercises:
                exercise_count = len(exercises) if isinstance(exercises, list) else 0
                if exercise_count > max_exercise_count:
                    max_exercise_count = exercise_count
                    most_exercises_workout = workout

        records = {}

        if longest_workout:
            records['longest_workout'] = {
                'duration': longest_workout['duration'],
                'date': longest_workout['workout_date'].strftime('%Y-%m-%d'),
                'workout_id': longest_workout['id']
            }

        if highest_points:
            records['highest_points'] = {
                'points': highest_points['points_earned'],
                'date': highest_points['workout_date'].strftime('%Y-%m-%d'),
                'workout_id': highest_points['id']
            }

        if most_exercises_workout:
            records['most_exercises'] = {
                'count': max_exercise_count,
                'date': most_exercises_workout['workout_date'].strftime('%Y-%m-%d'),
                'workout_id': most_exercises_workout['id']
            }

        # Calculate milestones
        profile = user.userprofile if hasattr(user, 'userprofile') else None
        milestones = []

        if profile:
            # Pre-fetch milestone workout dates in bulk
            workout_milestones = [10, 25, 50, 100, 250, 500]
            applicable_milestones = [m for m in workout_milestones if profile.total_workouts >= m]
            
            if applicable_milestones:
                max_milestone = max(applicable_milestones)
                # Single query to get workout dates up to max milestone
                milestone_workouts = list(workouts.order_by('workout_date').values_list(
                    'workout_date', flat=True
                )[:max_milestone])
                
                for milestone in applicable_milestones:
                    if len(milestone_workouts) >= milestone:
                        milestones.append({
                            'type': 'total_workouts',
                            'value': milestone,
                            'achieved_date': milestone_workouts[milestone - 1].strftime('%Y-%m-%d')
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
