'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
    User, 
    Trophy, 
    Dumbbell, 
    Flame,
    Users,
    Loader2,
    ArrowLeft
} from 'lucide-react';
import { socialAPI } from '@/lib/api-client';

interface UserProfile {
    user: {
        id: number;
        username: string;
        first_name: string;
        last_name: string;
        avatar_url?: string;
        level: number;
    };
    is_following: boolean;
    followers_count: number;
    following_count: number;
    profile: {
        bio?: string;
        total_workouts: number;
        total_points: number;
        current_streak: number;
        longest_streak: number;
    };
}

export default function UserProfilePage() {
    const router = useRouter();
    const params = useParams();
    const userId = params?.id as string;
    
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (userId) {
            loadProfile();
        }
    }, [userId]);

    const loadProfile = async () => {
        setIsLoading(true);
        try {
            const data = await socialAPI.getUserProfile(parseInt(userId));
            setProfile(data);
            setIsFollowing(data.is_following);
        } catch (err) {
            console.error('Failed to load profile:', err);
            setError('Failed to load profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFollowToggle = async () => {
        if (!profile) return;
        
        setIsUpdating(true);
        try {
            if (isFollowing) {
                await socialAPI.unfollowUser(profile.user.id);
            } else {
                await socialAPI.followUser(profile.user.id);
            }
            setIsFollowing(!isFollowing);
            // Reload to update follower count
            await loadProfile();
        } catch (err) {
            console.error('Failed to follow/unfollow:', err);
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="container mx-auto p-6 max-w-4xl">
                <Card className="p-8 text-center">
                    <p className="text-muted-foreground">{error || 'Profile not found'}</p>
                    <Button className="mt-4" onClick={() => router.back()}>
                        Go Back
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            {/* Back Button */}
            <Button 
                variant="ghost" 
                size="sm" 
                className="mb-4"
                onClick={() => router.back()}
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
            </Button>

            {/* Profile Header */}
            <Card className="p-8 mb-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    <Avatar className="w-24 h-24">
                        <AvatarFallback className="text-3xl">
                            {profile.user.username[0].toUpperCase()}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold">{profile.user.username}</h1>
                            <Badge variant="secondary" className="text-sm">
                                Level {profile.user.level}
                            </Badge>
                        </div>
                        
                        {profile.user.first_name && (
                            <p className="text-muted-foreground mb-3">
                                {profile.user.first_name} {profile.user.last_name}
                            </p>
                        )}

                        {profile.profile.bio && (
                            <p className="text-sm mb-4">{profile.profile.bio}</p>
                        )}

                        <div className="flex gap-6 text-sm">
                            <div>
                                <span className="font-bold">{profile.followers_count}</span>
                                <span className="text-muted-foreground ml-1">followers</span>
                            </div>
                            <div>
                                <span className="font-bold">{profile.following_count}</span>
                                <span className="text-muted-foreground ml-1">following</span>
                            </div>
                        </div>
                    </div>

                    <Button 
                        onClick={handleFollowToggle}
                        disabled={isUpdating}
                        variant={isFollowing ? 'outline' : 'default'}
                        className="gap-2"
                    >
                        {isUpdating ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Users className="w-4 h-4" />
                        )}
                        {isFollowing ? 'Unfollow' : 'Follow'}
                    </Button>
                </div>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Dumbbell className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{profile.profile.total_workouts}</p>
                            <p className="text-xs text-muted-foreground">Workouts</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <Trophy className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{profile.profile.total_points}</p>
                            <p className="text-xs text-muted-foreground">XP Points</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-500/20 rounded-lg">
                            <Flame className="w-5 h-5 text-orange-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{profile.profile.current_streak}</p>
                            <p className="text-xs text-muted-foreground">Day Streak</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                            <Flame className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{profile.profile.longest_streak}</p>
                            <p className="text-xs text-muted-foreground">Best Streak</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Recent Activity (placeholder for future) */}
            <Card className="p-6 mt-6">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <p className="text-muted-foreground text-center py-8">
                    Activity feed coming soon
                </p>
            </Card>
        </div>
    );
}
