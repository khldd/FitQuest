"""
Django management command to load exercise database
"""
from django.core.management.base import BaseCommand
from exercises.models import Exercise


class Command(BaseCommand):
    help = 'Load exercise database into Django'

    # Mapping for muscle groups
    MUSCLE_MAPPING = {
        'chest': 'chest',
        'lats': 'back',
        'rhomboids': 'back',
        'shoulders': 'shoulders',
        'rearDelts': 'shoulders',
        'quadriceps': 'quads',
        'hamstrings': 'hamstrings',
        'glutes': 'glutes',
        'calves': 'calves',
        'biceps': 'biceps',
        'triceps': 'triceps',
        'abs': 'abs',
        'obliques': 'obliques',
        'trapezius': 'back',
        'forearms': 'biceps',
    }

    # Equipment mapping
    EQUIPMENT_MAPPING = {
        'bodyweight': 'bodyweight',
        'home': 'dumbbells',  # default for home
        'gym': 'barbell',  # default for gym
    }

    def handle(self, *args, **options):
        exercises_data = self.get_exercises_data()

        Exercise.objects.all().delete()
        self.stdout.write('Deleted existing exercises')

        created_count = 0
        for exercise_data in exercises_data:
            try:
                Exercise.objects.create(**exercise_data)
                created_count += 1
                self.stdout.write(f'Created: {exercise_data["name"]}')
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'Error creating {exercise_data.get("name", "unknown")}: {str(e)}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'Successfully loaded {created_count} exercises')
        )

    def parse_reps(self, reps_str):
        """Parse reps string like '8-12' or '30-60s' into min and max"""
        reps_str = reps_str.replace('s', '').replace(' each leg', '').replace(' each side', '')
        if '-' in reps_str:
            parts = reps_str.split('-')
            return int(parts[0]), int(parts[1])
        return int(reps_str), int(reps_str)

    def parse_rest(self, rest_str):
        """Parse rest string like '60s' or '120s' into seconds"""
        return int(rest_str.replace('s', ''))

    def map_muscle(self, muscle):
        """Map muscle names to Django model choices"""
        return self.MUSCLE_MAPPING.get(muscle, 'chest')

    def map_equipment(self, equipment, exercise_name):
        """Map equipment to Django model choices based on exercise name and original equipment"""
        # More specific mapping based on exercise names
        if 'dumbbell' in exercise_name.lower():
            return 'dumbbells'
        elif 'barbell' in exercise_name.lower():
            return 'barbell'
        elif 'cable' in exercise_name.lower() or 'machine' in exercise_name.lower() or 'lat pulldown' in exercise_name.lower():
            return 'machine'
        elif equipment == 'bodyweight':
            return 'bodyweight'
        elif equipment == 'home':
            return 'dumbbells'
        else:  # gym
            return 'barbell'

    def get_exercises_data(self):
        """Return list of all exercises"""
        return [
            # CHEST
            {
                'name': 'Push-ups',
                'primary_muscle': 'chest',
                'secondary_muscles': ['shoulders', 'triceps'],
                'equipment': 'bodyweight',
                'difficulty': 'beginner',
                'sets_min': 3, 'sets_max': 3,
                'reps_min': 8, 'reps_max': 15,
                'rest_seconds': 60,
                'description': 'Classic bodyweight chest exercise',
                'instructions': [
                    'Start in plank position with hands slightly wider than shoulders',
                    'Lower body until chest nearly touches floor',
                    'Push back up to starting position',
                    'Keep core tight throughout movement'
                ],
                'tips': ['Modify on knees if needed', 'Focus on controlled movement', 'Keep straight line from head to heels']
            },
            {
                'name': 'Incline Push-ups',
                'primary_muscle': 'chest',
                'secondary_muscles': ['shoulders', 'triceps'],
                'equipment': 'bodyweight',
                'difficulty': 'beginner',
                'sets_min': 3, 'sets_max': 3,
                'reps_min': 10, 'reps_max': 15,
                'rest_seconds': 60,
                'description': 'Easier push-up variation using elevation',
                'instructions': [
                    'Place hands on elevated surface (bench, couch, stairs)',
                    'Walk feet back to create incline angle',
                    'Perform push-up motion with controlled tempo',
                    'The higher the incline, the easier the exercise'
                ],
                'tips': ['Great for beginners', 'Use stairs for different angles', 'Progress to flat push-ups']
            },
            {
                'name': 'Diamond Push-ups',
                'primary_muscle': 'triceps',
                'secondary_muscles': ['chest', 'shoulders'],
                'equipment': 'bodyweight',
                'difficulty': 'advanced',
                'sets_min': 3, 'sets_max': 3,
                'reps_min': 5, 'reps_max': 12,
                'rest_seconds': 75,
                'description': 'Advanced push-up targeting triceps',
                'instructions': [
                    'Form diamond shape with hands under chest',
                    'Lower body while keeping elbows close to sides',
                    'Push back up focusing on tricep engagement',
                    'Maintain straight body line'
                ],
                'tips': ['Very challenging variation', 'Focus on triceps', 'Modify on knees if needed']
            },
            {
                'name': 'Barbell Bench Press',
                'primary_muscle': 'chest',
                'secondary_muscles': ['shoulders', 'triceps'],
                'equipment': 'barbell',
                'difficulty': 'intermediate',
                'sets_min': 4, 'sets_max': 4,
                'reps_min': 6, 'reps_max': 10,
                'rest_seconds': 120,
                'description': 'King of upper body pressing movements',
                'instructions': [
                    'Lie on bench with eyes under barbell',
                    'Grip bar slightly wider than shoulder width',
                    'Lower bar to chest with control',
                    'Press bar up in slight arc to starting position'
                ],
                'tips': ['Always use spotter for heavy weights', 'Keep feet planted', 'Retract shoulder blades']
            },
            {
                'name': 'Dumbbell Bench Press',
                'primary_muscle': 'chest',
                'secondary_muscles': ['shoulders', 'triceps'],
                'equipment': 'dumbbells',
                'difficulty': 'intermediate',
                'sets_min': 3, 'sets_max': 3,
                'reps_min': 8, 'reps_max': 12,
                'rest_seconds': 90,
                'description': 'Chest press with dumbbells for greater range of motion',
                'instructions': [
                    'Lie on bench holding dumbbells at chest level',
                    'Press dumbbells up and slightly together',
                    'Lower with control to stretch chest',
                    'Maintain stable core throughout'
                ],
                'tips': ['Greater range of motion than barbell', 'Control the weight', 'Focus on chest squeeze at top']
            },
            {
                'name': 'Dumbbell Flyes',
                'primary_muscle': 'chest',
                'secondary_muscles': [],
                'equipment': 'dumbbells',
                'difficulty': 'intermediate',
                'sets_min': 3, 'sets_max': 3,
                'reps_min': 10, 'reps_max': 15,
                'rest_seconds': 60,
                'description': 'Isolation exercise for chest',
                'instructions': [
                    'Lie on bench with dumbbells extended above chest',
                    'Lower weights in wide arc with slight elbow bend',
                    'Feel stretch in chest at bottom',
                    'Bring weights together above chest'
                ],
                'tips': ['Use lighter weight', 'Focus on stretch and squeeze', 'Keep slight bend in elbows']
            },

            # BACK
            {
                'name': 'Pull-ups',
                'primary_muscle': 'back',
                'secondary_muscles': ['biceps'],
                'equipment': 'bodyweight',
                'difficulty': 'intermediate',
                'sets_min': 3, 'sets_max': 3,
                'reps_min': 5, 'reps_max': 12,
                'rest_seconds': 120,
                'description': 'Essential back and bicep builder',
                'instructions': [
                    'Hang from bar with overhand grip, hands shoulder-width apart',
                    'Pull body up until chin clears bar',
                    'Lower with control to full arm extension',
                    'Engage lats and avoid swinging'
                ],
                'tips': ['Use assistance band if needed', 'Focus on lat engagement', 'Full range of motion']
            },
            {
                'name': 'Inverted Rows',
                'primary_muscle': 'back',
                'secondary_muscles': ['biceps'],
                'equipment': 'bodyweight',
                'difficulty': 'beginner',
                'sets_min': 3, 'sets_max': 3,
                'reps_min': 8, 'reps_max': 15,
                'rest_seconds': 60,
                'description': 'Horizontal pulling exercise',
                'instructions': [
                    'Lie under table or use suspension trainer',
                    'Grip edge with overhand grip',
                    'Pull chest to bar/table keeping body straight',
                    'Lower with control'
                ],
                'tips': ['Great pull-up progression', 'Adjust angle for difficulty', 'Squeeze shoulder blades']
            },
            {
                'name': 'Bent-over Barbell Rows',
                'primary_muscle': 'back',
                'secondary_muscles': ['biceps'],
                'equipment': 'barbell',
                'difficulty': 'intermediate',
                'sets_min': 4, 'sets_max': 4,
                'reps_min': 6, 'reps_max': 10,
                'rest_seconds': 90,
                'description': 'Compound back-building movement',
                'instructions': [
                    'Stand with feet hip-width, hold barbell with overhand grip',
                    'Hinge at hips, keep back straight',
                    'Pull bar to lower chest/upper abdomen',
                    'Squeeze shoulder blades together at top'
                ],
                'tips': ['Keep core tight', 'Don\'t round back', 'Pull with lats, not arms']
            },
            {
                'name': 'Lat Pulldowns',
                'primary_muscle': 'back',
                'secondary_muscles': ['biceps'],
                'equipment': 'machine',
                'difficulty': 'beginner',
                'sets_min': 3, 'sets_max': 3,
                'reps_min': 10, 'reps_max': 15,
                'rest_seconds': 75,
                'description': 'Machine-based lat exercise',
                'instructions': [
                    'Sit at lat pulldown machine with thighs secured',
                    'Grip bar wider than shoulder width',
                    'Pull bar to upper chest while leaning slightly back',
                    'Control the weight back to starting position'
                ],
                'tips': ['Don\'t pull behind neck', 'Focus on lat engagement', 'Lean back slightly']
            },
            {
                'name': 'Conventional Deadlifts',
                'primary_muscle': 'hamstrings',
                'secondary_muscles': ['glutes', 'back'],
                'equipment': 'barbell',
                'difficulty': 'intermediate',
                'sets_min': 4, 'sets_max': 4,
                'reps_min': 5, 'reps_max': 8,
                'rest_seconds': 180,
                'description': 'King of all exercises - full body strength builder',
                'instructions': [
                    'Stand with feet hip-width, bar over mid-foot',
                    'Grip bar with hands just outside legs',
                    'Keep chest up, back straight, drive through heels',
                    'Stand up by extending hips and knees simultaneously'
                ],
                'tips': ['Master form before adding weight', 'Keep bar close to body', 'Engage lats to protect back']
            },

            # SHOULDERS
            {
                'name': 'Pike Push-ups',
                'primary_muscle': 'shoulders',
                'secondary_muscles': ['triceps'],
                'equipment': 'bodyweight',
                'difficulty': 'intermediate',
                'sets_min': 3, 'sets_max': 3,
                'reps_min': 6, 'reps_max': 12,
                'rest_seconds': 75,
                'description': 'Bodyweight shoulder press variation',
                'instructions': [
                    'Start in downward dog position',
                    'Walk feet closer to hands to increase angle',
                    'Lower head toward ground between hands',
                    'Press back up to starting position'
                ],
                'tips': ['Great handstand push-up progression', 'Focus on shoulders', 'Elevate feet for more difficulty']
            },
            {
                'name': 'Overhead Press',
                'primary_muscle': 'shoulders',
                'secondary_muscles': ['triceps', 'abs'],
                'equipment': 'barbell',
                'difficulty': 'intermediate',
                'sets_min': 4, 'sets_max': 4,
                'reps_min': 6, 'reps_max': 10,
                'rest_seconds': 120,
                'description': 'Primary shoulder strength builder',
                'instructions': [
                    'Stand with feet hip-width, hold barbell at shoulder level',
                    'Press bar straight up overhead',
                    'Lower with control to starting position',
                    'Keep core tight throughout movement'
                ],
                'tips': ['Don\'t arch back excessively', 'Press in straight line', 'Engage core for stability']
            },
            {
                'name': 'Lateral Raises',
                'primary_muscle': 'shoulders',
                'secondary_muscles': [],
                'equipment': 'dumbbells',
                'difficulty': 'beginner',
                'sets_min': 3, 'sets_max': 3,
                'reps_min': 12, 'reps_max': 20,
                'rest_seconds': 45,
                'description': 'Isolation for side deltoids',
                'instructions': [
                    'Stand with dumbbells at sides',
                    'Raise arms out to sides until parallel to floor',
                    'Lower with control',
                    'Keep slight bend in elbows'
                ],
                'tips': ['Use lighter weight', 'Focus on side delts', 'Control the negative']
            },
            {
                'name': 'Face Pulls',
                'primary_muscle': 'shoulders',
                'secondary_muscles': ['back'],
                'equipment': 'cable',
                'difficulty': 'beginner',
                'sets_min': 3, 'sets_max': 3,
                'reps_min': 15, 'reps_max': 20,
                'rest_seconds': 45,
                'description': 'Rear deltoid and upper back exercise',
                'instructions': [
                    'Set cable at face height with rope attachment',
                    'Pull rope to face, separating hands at end',
                    'Focus on squeezing shoulder blades',
                    'Control the return'
                ],
                'tips': ['Great for posture', 'High reps work well', 'Focus on rear delts']
            },

            # LEGS
            {
                'name': 'Bodyweight Squats',
                'primary_muscle': 'quads',
                'secondary_muscles': ['glutes', 'hamstrings', 'calves'],
                'equipment': 'bodyweight',
                'difficulty': 'beginner',
                'sets_min': 3, 'sets_max': 3,
                'reps_min': 15, 'reps_max': 25,
                'rest_seconds': 60,
                'description': 'Fundamental leg exercise',
                'instructions': [
                    'Stand with feet shoulder-width apart',
                    'Lower by pushing hips back and bending knees',
                    'Descend until thighs parallel to floor',
                    'Drive through heels to return to standing'
                ],
                'tips': ['Keep chest up', 'Knees track over toes', 'Full range of motion']
            },
            {
                'name': 'Goblet Squats',
                'primary_muscle': 'quads',
                'secondary_muscles': ['glutes', 'hamstrings', 'abs'],
                'equipment': 'dumbbells',
                'difficulty': 'beginner',
                'sets_min': 3, 'sets_max': 3,
                'reps_min': 12, 'reps_max': 20,
                'rest_seconds': 75,
                'description': 'Weighted squat variation for learning form',
                'instructions': [
                    'Hold dumbbell or kettlebell at chest level',
                    'Perform squat while holding weight',
                    'Keep elbows pointing down',
                    'Use weight to help with balance and depth'
                ],
                'tips': ['Great for learning squat form', 'Weight helps with balance', 'Focus on depth']
            },
            {
                'name': 'Back Squats',
                'primary_muscle': 'quads',
                'secondary_muscles': ['glutes', 'hamstrings', 'abs'],
                'equipment': 'barbell',
                'difficulty': 'intermediate',
                'sets_min': 4, 'sets_max': 4,
                'reps_min': 6, 'reps_max': 12,
                'rest_seconds': 180,
                'description': 'King of leg exercises',
                'instructions': [
                    'Position bar on upper traps in squat rack',
                    'Step back and set feet shoulder-width apart',
                    'Descend by pushing hips back and bending knees',
                    'Drive through heels to return to standing'
                ],
                'tips': ['Master bodyweight squats first', 'Keep core tight', 'Full depth for best results']
            },
            {
                'name': 'Forward Lunges',
                'primary_muscle': 'quads',
                'secondary_muscles': ['glutes', 'hamstrings', 'calves'],
                'equipment': 'bodyweight',
                'difficulty': 'beginner',
                'sets_min': 3, 'sets_max': 3,
                'reps_min': 10, 'reps_max': 15,
                'rest_seconds': 60,
                'description': 'Unilateral leg exercise',
                'instructions': [
                    'Step forward with one leg',
                    'Lower until both knees at 90 degrees',
                    'Push off front foot to return to starting position',
                    'Alternate legs or complete all reps on one side'
                ],
                'tips': ['Keep torso upright', 'Don\'t let knee cave inward', 'Control the descent']
            },
            {
                'name': 'Bulgarian Split Squats',
                'primary_muscle': 'quads',
                'secondary_muscles': ['glutes', 'hamstrings'],
                'equipment': 'bodyweight',
                'difficulty': 'intermediate',
                'sets_min': 3, 'sets_max': 3,
                'reps_min': 8, 'reps_max': 15,
                'rest_seconds': 75,
                'description': 'Advanced single-leg exercise',
                'instructions': [
                    'Place rear foot on bench or elevated surface',
                    'Lower into lunge position on front leg',
                    'Drive through front heel to return to start',
                    'Complete all reps before switching legs'
                ],
                'tips': ['Challenging single-leg exercise', 'Focus on front leg', 'Great for balance']
            },
            {
                'name': 'Romanian Deadlifts',
                'primary_muscle': 'hamstrings',
                'secondary_muscles': ['glutes', 'back'],
                'equipment': 'barbell',
                'difficulty': 'intermediate',
                'sets_min': 3, 'sets_max': 3,
                'reps_min': 8, 'reps_max': 12,
                'rest_seconds': 90,
                'description': 'Hamstring and glute builder',
                'instructions': [
                    'Hold barbell with overhand grip at hip level',
                    'Keep knees slightly bent throughout movement',
                    'Hinge at hips, lowering bar along legs',
                    'Feel stretch in hamstrings, then return to standing'
                ],
                'tips': ['Focus on hip hinge movement', 'Keep bar close to legs', 'Feel the hamstring stretch']
            },
            {
                'name': 'Glute Bridges',
                'primary_muscle': 'glutes',
                'secondary_muscles': ['hamstrings'],
                'equipment': 'bodyweight',
                'difficulty': 'beginner',
                'sets_min': 3, 'sets_max': 3,
                'reps_min': 15, 'reps_max': 25,
                'rest_seconds': 45,
                'description': 'Glute activation exercise',
                'instructions': [
                    'Lie on back with knees bent, feet flat on floor',
                    'Squeeze glutes and lift hips up',
                    'Create straight line from knees to shoulders',
                    'Lower with control'
                ],
                'tips': ['Focus on glute squeeze', 'Don\'t arch back excessively', 'Pause at top']
            },
            {
                'name': 'Hip Thrusts',
                'primary_muscle': 'glutes',
                'secondary_muscles': ['hamstrings'],
                'equipment': 'barbell',
                'difficulty': 'intermediate',
                'sets_min': 3, 'sets_max': 3,
                'reps_min': 12, 'reps_max': 20,
                'rest_seconds': 75,
                'description': 'Premier glute builder',
                'instructions': [
                    'Sit with upper back against bench, barbell over hips',
                    'Drive through heels to lift hips up',
                    'Squeeze glutes at top position',
                    'Lower with control'
                ],
                'tips': ['Excellent glute builder', 'Use pad for comfort', 'Full hip extension']
            },
            {
                'name': 'Calf Raises',
                'primary_muscle': 'calves',
                'secondary_muscles': [],
                'equipment': 'bodyweight',
                'difficulty': 'beginner',
                'sets_min': 4, 'sets_max': 4,
                'reps_min': 15, 'reps_max': 25,
                'rest_seconds': 45,
                'description': 'Calf isolation exercise',
                'instructions': [
                    'Stand with balls of feet on elevated surface',
                    'Lower heels below platform level',
                    'Rise up onto toes as high as possible',
                    'Control both up and down phases'
                ],
                'tips': ['Full range of motion', 'Pause at top', 'Control the negative']
            },

            # CORE
            {
                'name': 'Plank',
                'primary_muscle': 'abs',
                'secondary_muscles': ['shoulders', 'glutes'],
                'equipment': 'bodyweight',
                'difficulty': 'beginner',
                'sets_min': 3, 'sets_max': 3,
                'reps_min': 30, 'reps_max': 60,
                'rest_seconds': 60,
                'description': 'Core stability exercise',
                'instructions': [
                    'Start in push-up position on forearms',
                    'Keep body in straight line from head to heels',
                    'Engage core and glutes',
                    'Breathe normally while holding position'
                ],
                'tips': ['Don\'t let hips sag', 'Keep neutral spine', 'Build up time gradually']
            },
            {
                'name': 'Dead Bug',
                'primary_muscle': 'abs',
                'secondary_muscles': [],
                'equipment': 'bodyweight',
                'difficulty': 'beginner',
                'sets_min': 3, 'sets_max': 3,
                'reps_min': 10, 'reps_max': 15,
                'rest_seconds': 45,
                'description': 'Core stability and coordination exercise',
                'instructions': [
                    'Lie on back with arms extended toward ceiling',
                    'Lift knees to 90 degrees',
                    'Lower opposite arm and leg simultaneously',
                    'Return to start and repeat on other side'
                ],
                'tips': ['Keep lower back pressed to floor', 'Move slowly and controlled', 'Great for core stability']
            },
            {
                'name': 'Bicycle Crunches',
                'primary_muscle': 'abs',
                'secondary_muscles': ['obliques'],
                'equipment': 'bodyweight',
                'difficulty': 'beginner',
                'sets_min': 3, 'sets_max': 3,
                'reps_min': 20, 'reps_max': 30,
                'rest_seconds': 45,
                'description': 'Dynamic core exercise',
                'instructions': [
                    'Lie on back with hands behind head',
                    'Lift shoulders off ground',
                    'Bring opposite elbow to knee while extending other leg',
                    'Alternate sides in cycling motion'
                ],
                'tips': ['Don\'t pull on neck', 'Focus on rotation', 'Control the movement']
            },
            {
                'name': 'Russian Twists',
                'primary_muscle': 'obliques',
                'secondary_muscles': ['abs'],
                'equipment': 'bodyweight',
                'difficulty': 'intermediate',
                'sets_min': 3, 'sets_max': 3,
                'reps_min': 20, 'reps_max': 30,
                'rest_seconds': 45,
                'description': 'Rotational core exercise',
                'instructions': [
                    'Sit with knees bent, lean back slightly',
                    'Lift feet off ground if possible',
                    'Rotate torso side to side',
                    'Touch ground beside hips with hands'
                ],
                'tips': ['Keep chest up', 'Control the rotation', 'Add weight for difficulty']
            },
            {
                'name': 'Side Plank',
                'primary_muscle': 'obliques',
                'secondary_muscles': ['abs', 'shoulders'],
                'equipment': 'bodyweight',
                'difficulty': 'intermediate',
                'sets_min': 3, 'sets_max': 3,
                'reps_min': 20, 'reps_max': 45,
                'rest_seconds': 60,
                'description': 'Lateral core stability exercise',
                'instructions': [
                    'Lie on side with forearm on ground',
                    'Stack feet and lift hips off ground',
                    'Create straight line from head to feet',
                    'Hold position, then switch sides'
                ],
                'tips': ['Don\'t let hips sag', 'Keep body aligned', 'Modify on knees if needed']
            },

            # ARMS
            {
                'name': 'Tricep Dips',
                'primary_muscle': 'triceps',
                'secondary_muscles': ['shoulders'],
                'equipment': 'bodyweight',
                'difficulty': 'intermediate',
                'sets_min': 3, 'sets_max': 3,
                'reps_min': 8, 'reps_max': 15,
                'rest_seconds': 75,
                'description': 'Bodyweight tricep builder',
                'instructions': [
                    'Sit on edge of bench with hands beside hips',
                    'Slide forward off bench, supporting weight on arms',
                    'Lower body by bending elbows',
                    'Push back up to starting position'
                ],
                'tips': ['Keep elbows close to body', 'Don\'t go too low', 'Bend knees to make easier']
            },
            {
                'name': 'Close-Grip Push-ups',
                'primary_muscle': 'triceps',
                'secondary_muscles': ['chest', 'shoulders'],
                'equipment': 'bodyweight',
                'difficulty': 'intermediate',
                'sets_min': 3, 'sets_max': 3,
                'reps_min': 8, 'reps_max': 15,
                'rest_seconds': 60,
                'description': 'Push-up variation emphasizing triceps',
                'instructions': [
                    'Start in push-up position with hands closer together',
                    'Keep elbows close to sides as you lower',
                    'Push back up focusing on tricep engagement',
                    'Maintain straight body line'
                ],
                'tips': ['Hands closer than regular push-ups', 'Focus on triceps', 'Keep elbows tucked']
            },
            {
                'name': 'Dumbbell Bicep Curls',
                'primary_muscle': 'biceps',
                'secondary_muscles': [],
                'equipment': 'dumbbells',
                'difficulty': 'beginner',
                'sets_min': 3, 'sets_max': 3,
                'reps_min': 10, 'reps_max': 15,
                'rest_seconds': 60,
                'description': 'Classic bicep isolation exercise',
                'instructions': [
                    'Stand with dumbbells at sides, palms facing forward',
                    'Curl weights up by flexing biceps',
                    'Squeeze at top, then lower with control',
                    'Keep elbows stationary at sides'
                ],
                'tips': ['Don\'t swing the weights', 'Control the negative', 'Full range of motion']
            },
            {
                'name': 'Hammer Curls',
                'primary_muscle': 'biceps',
                'secondary_muscles': [],
                'equipment': 'dumbbells',
                'difficulty': 'beginner',
                'sets_min': 3, 'sets_max': 3,
                'reps_min': 10, 'reps_max': 15,
                'rest_seconds': 60,
                'description': 'Neutral grip bicep exercise',
                'instructions': [
                    'Hold dumbbells with neutral grip (palms facing each other)',
                    'Curl weights up keeping palms facing in',
                    'Squeeze biceps at top',
                    'Lower with control'
                ],
                'tips': ['Different angle than regular curls', 'Works brachialis muscle', 'Keep wrists straight']
            },
        ]
