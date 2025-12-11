from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.db.models import Q
from .models import Follow, SocialPost, PostLike, PostComment
from .serializers import (
    FollowSerializer,
    SocialPostSerializer,
    CreatePostSerializer,
    PostLikeSerializer,
    PostCommentSerializer,
    UserBasicSerializer
)


class FollowViewSet(viewsets.ModelViewSet):
    """ViewSet for Follow model"""
    queryset = Follow.objects.all()
    serializer_class = FollowSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Get follows where user is the follower or following
        user = self.request.user
        return Follow.objects.filter(Q(follower=user) | Q(following=user))

    def create(self, request):
        """Follow a user"""
        following_id = request.data.get('following_id')
        
        if not following_id:
            return Response(
                {'error': 'following_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if int(following_id) == request.user.id:
            return Response(
                {'error': 'Cannot follow yourself'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            following_user = User.objects.get(id=following_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Check if already following
        if Follow.objects.filter(follower=request.user, following=following_user).exists():
            return Response(
                {'error': 'Already following this user'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create follow
        follow = Follow.objects.create(
            follower=request.user,
            following=following_user
        )
        
        serializer = self.get_serializer(follow)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['delete'])
    def unfollow(self, request):
        """Unfollow a user"""
        following_id = request.query_params.get('following_id')
        
        if not following_id:
            return Response(
                {'error': 'following_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            follow = Follow.objects.get(
                follower=request.user,
                following_id=following_id
            )
            follow.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Follow.DoesNotExist:
            return Response(
                {'error': 'Not following this user'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['get'])
    def following(self, request):
        """Get list of users I'm following"""
        follows = Follow.objects.filter(follower=request.user)
        serializer = self.get_serializer(follows, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def followers(self, request):
        """Get list of users following me"""
        follows = Follow.objects.filter(following=request.user)
        serializer = self.get_serializer(follows, many=True)
        return Response(serializer.data)


class SocialFeedViewSet(viewsets.ModelViewSet):
    """ViewSet for Social Feed"""
    queryset = SocialPost.objects.all()
    serializer_class = SocialPostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Get posts from users I follow + my own posts"""
        user = self.request.user
        
        # Get users I'm following
        following_ids = Follow.objects.filter(follower=user).values_list('following_id', flat=True)
        
        # Include my own posts + posts from users I follow
        return SocialPost.objects.filter(
            Q(user=user) | Q(user_id__in=following_ids)
        ).order_by('-created_at')

    def create(self, request):
        """Create a new post"""
        serializer = CreatePostSerializer(data=request.data)
        if serializer.is_valid():
            post = SocialPost.objects.create(
                user=request.user,
                **serializer.validated_data
            )
            return Response(
                SocialPostSerializer(post, context={'request': request}).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        """Like a post"""
        post = self.get_object()
        
        # Check if already liked
        if PostLike.objects.filter(post=post, user=request.user).exists():
            return Response(
                {'error': 'Already liked this post'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        like = PostLike.objects.create(post=post, user=request.user)
        serializer = PostLikeSerializer(like)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete'])
    def unlike(self, request, pk=None):
        """Unlike a post"""
        post = self.get_object()
        
        try:
            like = PostLike.objects.get(post=post, user=request.user)
            like.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except PostLike.DoesNotExist:
            return Response(
                {'error': 'Not liked yet'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def comment(self, request, pk=None):
        """Comment on a post"""
        post = self.get_object()
        content = request.data.get('content')
        
        if not content:
            return Response(
                {'error': 'content is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        comment = PostComment.objects.create(
            post=post,
            user=request.user,
            content=content
        )
        
        serializer = PostCommentSerializer(comment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def my_posts(self, request):
        """Get my own posts"""
        posts = SocialPost.objects.filter(user=request.user)
        serializer = self.get_serializer(posts, many=True)
        return Response(serializer.data)


class UserSearchViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for searching users"""
    queryset = User.objects.all()
    serializer_class = UserBasicSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Search users by username or return all users for detail view"""
        search = self.request.query_params.get('search', '')
        
        # For detail actions (like profile), return all users
        if self.action in ['retrieve', 'profile']:
            return User.objects.select_related('profile').all()
        
        # For list action, only return search results
        if search:
            return User.objects.select_related('profile').filter(
                Q(username__icontains=search) | 
                Q(first_name__icontains=search) | 
                Q(last_name__icontains=search)
            ).exclude(id=self.request.user.id)[:20]
        return User.objects.none()

    @action(detail=True, methods=['get'])
    def profile(self, request, pk=None):
        """Get a user's public profile with follow status"""
        from accounts.models import UserProfile
        
        user = self.get_object()
        
        # Ensure user has a profile (create if doesn't exist)
        profile, created = UserProfile.objects.get_or_create(
            user=user,
            defaults={'username': user.username}
        )
        
        # Check if current user is following this user
        is_following = Follow.objects.filter(
            follower=request.user,
            following=user
        ).exists()
        
        # Get stats
        followers_count = Follow.objects.filter(following=user).count()
        following_count = Follow.objects.filter(follower=user).count()
        
        data = {
            'user': UserBasicSerializer(user).data,
            'is_following': is_following,
            'followers_count': followers_count,
            'following_count': following_count,
            'profile': {
                'bio': profile.bio,
                'total_workouts': profile.total_workouts,
                'total_points': profile.total_points,
                'current_streak': profile.current_streak,
                'longest_streak': profile.longest_streak,
            }
        }
        
        return Response(data)
