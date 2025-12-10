from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum
from datetime import date
from .models import FoodItem, NutritionGoal, MealLog
from .serializers import FoodItemSerializer, NutritionGoalSerializer, MealLogSerializer

class FoodItemViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = FoodItem.objects.all()
    serializer_class = FoodItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ['name']

class NutritionGoalViewSet(viewsets.ModelViewSet):
    serializer_class = NutritionGoalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return NutritionGoal.objects.filter(user=self.request.user)

    def list(self, request, *args, **kwargs):
        # Return the single goal object instead of a list
        goal = self.get_queryset().first()
        if not goal:
            return Response({})
        serializer = self.get_serializer(goal)
        return Response(serializer.data)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class MealLogViewSet(viewsets.ModelViewSet):
    serializer_class = MealLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['date', 'meal_type']

    def get_queryset(self):
        return MealLog.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def daily_summary(self, request):
        query_date = request.query_params.get('date', str(date.today()))
        logs = self.get_queryset().filter(date=query_date)
        
        summary = logs.aggregate(
            total_calories=Sum('calories'),
            total_protein=Sum('protein'),
            total_carbs=Sum('carbs'),
            total_fat=Sum('fat')
        )
        
        # Handle None values if no logs exist
        return Response({
            'date': query_date,
            'total_calories': summary['total_calories'] or 0,
            'total_protein': summary['total_protein'] or 0,
            'total_carbs': summary['total_carbs'] or 0,
            'total_fat': summary['total_fat'] or 0
        })
