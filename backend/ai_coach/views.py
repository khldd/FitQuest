from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.conf import settings
import requests
from .models import ChatMessage
from .serializers import ChatMessageSerializer, UserContextSerializer


class ChatViewSet(viewsets.ModelViewSet):
    """
    API endpoint for AI Coach chat.
    Stores messages and forwards to n8n workflow for AI processing.
    """
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Return only the authenticated user's messages
        return ChatMessage.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def send_message(self, request):
        """
        Send a message to AI coach and get response.
        
        Expected payload:
        {
            "message": "How should I train chest today?"
        }
        """
        user = request.user
        message_content = request.data.get('message', '').strip()
        
        if not message_content:
            return Response(
                {'error': 'Message cannot be empty'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Save user message
        user_message = ChatMessage.objects.create(
            user=user,
            role='user',
            content=message_content
        )
        
        # Get user context
        user_context = UserContextSerializer.get_user_context(user)
        
        # Prepare payload for n8n (no history - n8n has memory)
        n8n_payload = {
            'user_id': user.id,
            'message': message_content,
            'user_context': user_context,
        }
        
        try:
            # Call n8n webhook
            n8n_url = getattr(settings, 'N8N_COACH_WEBHOOK_URL', None)
            
            if not n8n_url:
                # Fallback: Return a default response if n8n is not configured
                ai_response = self._get_fallback_response(message_content, user_context)
            else:
                # Call n8n workflow
                response = requests.post(
                    n8n_url,
                    json=n8n_payload,
                    timeout=30
                )
                response.raise_for_status()
                
                # Extract AI response
                ai_data = response.json()
                ai_response = ai_data.get('response', 'Sorry, I could not process your request.')
            
            # Save AI response
            assistant_message = ChatMessage.objects.create(
                user=user,
                role='assistant',
                content=ai_response,
                metadata={'n8n_response': True}
            )
            
            return Response({
                'user_message': ChatMessageSerializer(user_message).data,
                'assistant_message': ChatMessageSerializer(assistant_message).data,
            })
            
        except requests.exceptions.RequestException as e:
            # If n8n call fails, return fallback response
            ai_response = self._get_fallback_response(message_content, user_context)
            
            assistant_message = ChatMessage.objects.create(
                user=user,
                role='assistant',
                content=ai_response,
                metadata={'fallback': True, 'error': str(e)}
            )
            
            return Response({
                'user_message': ChatMessageSerializer(user_message).data,
                'assistant_message': ChatMessageSerializer(assistant_message).data,
                'warning': 'AI service unavailable, using fallback response'
            })
    
    @action(detail=False, methods=['delete'])
    def clear_history(self, request):
        """Clear all chat history for the authenticated user"""
        deleted_count, _ = ChatMessage.objects.filter(user=request.user).delete()
        return Response({
            'message': f'Deleted {deleted_count} messages',
            'deleted_count': deleted_count
        })
    
    @action(detail=False, methods=['get'])
    def context(self, request):
        """Get user context that will be sent to AI"""
        user_context = UserContextSerializer.get_user_context(request.user)
        return Response(user_context)
    
    def _get_fallback_response(self, message, user_context):
        """Provide a helpful fallback response when AI is unavailable"""
        username = user_context.get('username', 'there')
        level = user_context.get('level', 1)
        
        fallback_responses = {
            'chest': f"Hey {username}! For chest training at level {level}, I recommend focusing on compound movements like bench press and push-ups. Include 3-4 exercises with 3-4 sets each.",
            'leg': f"Hi {username}! Leg day is crucial. Start with squats or deadlifts, then move to lunges and leg press. Don't forget calf raises!",
            'back': f"Great question {username}! For back, focus on pull-ups, rows, and deadlifts. These compound movements will build strength and size.",
            'workout': f"Hey {username}! Based on your level {level}, I'd suggest a balanced routine targeting different muscle groups each session.",
        }
        
        # Simple keyword matching
        message_lower = message.lower()
        for keyword, response in fallback_responses.items():
            if keyword in message_lower:
                return response
        
        # Default response
        return f"Hey {username}! I'm your AI workout coach. I can help you with workout plans, form tips, nutrition advice, and motivation. What would you like to know?"
