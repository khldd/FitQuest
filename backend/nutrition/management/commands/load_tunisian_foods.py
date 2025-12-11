import csv
from django.core.management.base import BaseCommand
from nutrition.models import FoodItem


class Command(BaseCommand):
    help = 'Load Tunisian food items from CSV file'

    def handle(self, *args, **options):
        # Path to the food.txt file
        csv_file = r'c:\Users\ayedi\Desktop\workout-generator (3)\food.txt'
        
        self.stdout.write(f'Loading Tunisian food items from: {csv_file}\n')
        
        created_count = 0
        updated_count = 0
        error_count = 0
        
        try:
            with open(csv_file, 'r', encoding='utf-8') as file:
                # Read all lines to check the file
                lines = file.readlines()
                self.stdout.write(f'Found {len(lines)} lines in file\n')
                
                # Reset to beginning
                file.seek(0)
                reader = csv.DictReader(file)
                
                for row in reader:
                    try:
                        name = row['Name'].strip()
                        calories = int(float(row['Calories (kcal)']))
                        protein = float(row['Protein (g)'])
                        carbs = float(row['Carbs (g)'])
                        fat = float(row['Fat (g)'])
                        serving_size = row['Serving size'].strip()
                        
                        # Check if food item already exists
                        food_item, created = FoodItem.objects.update_or_create(
                            name=name,
                            defaults={
                                'calories': calories,
                                'protein': protein,
                                'carbs': carbs,
                                'fat': fat,
                                'serving_size': serving_size,
                            }
                        )
                        
                        if created:
                            created_count += 1
                            self.stdout.write(self.style.SUCCESS(f'✓ Created: {name}'))
                        else:
                            updated_count += 1
                            self.stdout.write(self.style.WARNING(f'↻ Updated: {name}'))
                            
                    except Exception as e:
                        error_count += 1
                        self.stdout.write(self.style.ERROR(f'✗ Error processing {row.get("Name", "unknown")}: {str(e)}'))
                        
        except FileNotFoundError:
            self.stdout.write(self.style.ERROR(f'✗ File not found: {csv_file}'))
            return
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'✗ Error reading file: {str(e)}'))
            return
        
        # Summary
        self.stdout.write('\n' + '='*50)
        self.stdout.write(self.style.SUCCESS(f'✅ Successfully created: {created_count} items'))
        if updated_count > 0:
            self.stdout.write(self.style.WARNING(f'↻ Updated: {updated_count} items'))
        if error_count > 0:
            self.stdout.write(self.style.ERROR(f'✗ Errors: {error_count} items'))
        self.stdout.write('='*50 + '\n')
        
        total = FoodItem.objects.count()
        self.stdout.write(self.style.SUCCESS(f'📊 Total food items in database: {total}'))
