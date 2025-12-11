'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
    Heart, 
    MessageCircle, 
    Share2, 
    Users, 
    Search,
    Trophy,
    Dumbbell,
    Target,
    Loader2,
    Send
} from 'lucide-react';
import { socialAPI } from '@/lib/api-client';

interface SocialPost {
    id: number;
    user: {
        id: number;
        username: string;
        avatar_url?: string;
        level: number;
    };
    post_type: 'workout' | 'achievement' | 'milestone';
    content: string;
    workout_id?: number;
    achievement_id?: number;
    metadata?: any;
    created_at: string;
    likes_count: number;
    comments_count: number;
    user_has_liked: boolean;
    comments?: Array<{
        id: number;
        user: {
            id: number;
            username: string;
            avatar_url?: string;
        };
        content: string;
        created_at: string;
    }>;
}

export default function SocialPage() {
    const router = useRouter();
    const [feed, setFeed] = useState<SocialPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [showComments, setShowComments] = useState<{[key: number]: boolean}>({});
    const [commentText, setCommentText] = useState<{[key: number]: string}>({});

    useEffect(() => {
        loadFeed();
    }, []);

    const loadFeed = async () => {
        setIsLoading(true);
        try {
            const response = await socialAPI.getFeed();
            const posts = response.results || response;
            setFeed(Array.isArray(posts) ? posts : []);
        } catch (err) {
            console.error('Failed to load feed:', err);
            setError('Failed to load feed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }
        
        try {
            const results = await socialAPI.searchUsers(query);
            setSearchResults(results);
        } catch (err) {
            console.error('Search failed:', err);
        }
    };

    const handleLike = async (postId: number, isLiked: boolean) => {
        try {
            if (isLiked) {
                await socialAPI.unlikePost(postId);
            } else {
                await socialAPI.likePost(postId);
            }
            await loadFeed();
        } catch (err) {
            console.error('Failed to like/unlike post:', err);
        }
    };

    const handleComment = async (postId: number) => {
        const content = commentText[postId]?.trim();
        if (!content) return;

        try {
            await socialAPI.commentOnPost(postId, content);
            setCommentText(prev => ({ ...prev, [postId]: '' }));
            await loadFeed();
        } catch (err) {
            console.error('Failed to comment:', err);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    const getPostIcon = (type: string) => {
        switch (type) {
            case 'workout': return <Dumbbell className="w-5 h-5" />;
            case 'achievement': return <Trophy className="w-5 h-5" />;
            case 'milestone': return <Target className="w-5 h-5" />;
            default: return <Dumbbell className="w-5 h-5" />;
        }
    };

    const getPostColor = (type: string) => {
        switch (type) {
            case 'workout': return 'bg-blue-500/20 text-blue-400';
            case 'achievement': return 'bg-yellow-500/20 text-yellow-400';
            case 'milestone': return 'bg-purple-500/20 text-purple-400';
            default: return 'bg-gray-500/20 text-gray-400';
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Users className="w-8 h-8 text-primary" />
                    Social Feed
                </h1>
                <Button onClick={() => router.push('/social/discover')}>
                    <Search className="w-4 h-4 mr-2" />
                    Find Friends
                </Button>
            </div>

            {/* Quick Search */}
            <Card className="p-4 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Search for users..."
                        className="pl-10"
                    />
                </div>
                {searchResults.length > 0 && (
                    <div className="mt-2 space-y-2">
                        {searchResults.map((user) => (
                            <div
                                key={user.id}
                                className="flex items-center justify-between p-2 hover:bg-muted/50 rounded cursor-pointer"
                                onClick={() => router.push(`/social/profile/${user.id}`)}
                            >
                                <div className="flex items-center gap-2">
                                    <Avatar>
                                        <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{user.username}</p>
                                        <p className="text-xs text-muted-foreground">Level {user.level}</p>
                                    </div>
                                </div>
                                <Button size="sm" variant="outline">View</Button>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* Feed */}
            <div className="space-y-4">
                {feed.length === 0 ? (
                    <Card className="p-8 text-center">
                        <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">No Activity Yet</h3>
                        <p className="text-muted-foreground mb-4">
                            Follow friends to see their workouts and achievements
                        </p>
                        <Button onClick={() => router.push('/social/discover')}>
                            Find Friends
                        </Button>
                    </Card>
                ) : (
                    feed.map((post) => (
                        <Card key={post.id} className="p-6">
                            {/* Post Header */}
                            <div className="flex items-start gap-3 mb-4">
                                <Avatar
                                    className="cursor-pointer"
                                    onClick={() => router.push(`/social/profile/${post.user.id}`)}
                                >
                                    <AvatarFallback>{post.user.username[0].toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex-grow">
                                    <div className="flex items-center gap-2">
                                        <span 
                                            className="font-semibold cursor-pointer hover:underline"
                                            onClick={() => router.push(`/social/profile/${post.user.id}`)}
                                        >
                                            {post.user.username}
                                        </span>
                                        <Badge variant="secondary" className="text-xs">
                                            Lvl {post.user.level}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                            {formatDate(post.created_at)}
                                        </span>
                                    </div>
                                    <div className={`inline-flex items-center gap-1 mt-1 px-2 py-1 rounded text-xs ${getPostColor(post.post_type)}`}>
                                        {getPostIcon(post.post_type)}
                                        <span className="capitalize">{post.post_type}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Post Content */}
                            <div className="mb-4">
                                <p className="text-sm">{post.content}</p>
                                {post.metadata && post.metadata.duration && (
                                    <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                                        <span>⏱️ {post.metadata.duration}m</span>
                                        {post.metadata.intensity && (
                                            <span className="capitalize">💪 {post.metadata.intensity}</span>
                                        )}
                                        {post.metadata.points && (
                                            <span>⚡ +{post.metadata.points} XP</span>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Post Actions */}
                            <div className="flex items-center gap-4 pt-4 border-t">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleLike(post.id, post.user_has_liked)}
                                    className={post.user_has_liked ? 'text-red-500' : ''}
                                >
                                    <Heart className={`w-4 h-4 mr-1 ${post.user_has_liked ? 'fill-current' : ''}`} />
                                    {post.likes_count}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                                >
                                    <MessageCircle className="w-4 h-4 mr-1" />
                                    {post.comments_count}
                                </Button>
                            </div>

                            {/* Comments Section */}
                            {showComments[post.id] && (
                                <div className="mt-4 pt-4 border-t space-y-3">
                                    {post.comments && post.comments.map((comment) => (
                                        <div key={comment.id} className="flex gap-2">
                                            <Avatar className="w-6 h-6">
                                                <AvatarFallback className="text-xs">
                                                    {comment.user.username[0].toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-grow">
                                                <span className="font-medium text-sm">{comment.user.username}</span>
                                                <p className="text-sm text-muted-foreground">{comment.content}</p>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="flex gap-2">
                                        <Input
                                            value={commentText[post.id] || ''}
                                            onChange={(e) => setCommentText(prev => ({ ...prev, [post.id]: e.target.value }))}
                                            placeholder="Write a comment..."
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleComment(post.id);
                                                }
                                            }}
                                        />
                                        <Button size="icon" onClick={() => handleComment(post.id)}>
                                            <Send className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
