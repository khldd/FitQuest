from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from accounts.models import UserProfile


class Command(BaseCommand):
    help = 'Create UserProfile for all users that do not have one'

    def handle(self, *args, **options):
        users = User.objects.all()
        created_count = 0
        
        for user in users:
            profile, created = UserProfile.objects.get_or_create(
                user=user,
                defaults={'username': user.username}
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created profile for user: {user.username}')
                )
        
        if created_count == 0:
            self.stdout.write(
                self.style.SUCCESS('All users already have profiles')
            )
        else:
            self.stdout.write(
                self.style.SUCCESS(f'Created {created_count} new profiles')
            )
