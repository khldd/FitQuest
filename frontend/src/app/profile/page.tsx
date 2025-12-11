'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    User, 
    Trophy, 
    Dumbbell, 
    Flame,
    Loader2,
    Edit2,
    Save,
    X
} from 'lucide-react';
import { authAPI } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';

interface UserProfile {
    id: number;
    user: {
        id: number;
        username: string;
        email: string;
        first_name: string;
        last_name: string;
    };
    username: string;
    email: string;
    bio?: string;
    avatar_url?: string;
    total_workouts: number;
    total_points: number;
    current_streak: number;
    longest_streak: number;
    level: number;
}

export default function ProfilePage() {
    const router = useRouter();
    const { user: authUser } = useAuthStore();
    
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    
    // Edit form state
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [bio, setBio] = useState('');

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        setIsLoading(true);
        try {
            const data = await authAPI.getProfile();
            setProfile(data);
            setFirstName(data.user.first_name || '');
            setLastName(data.user.last_name || '');
            setBio(data.bio || '');
        } catch (err) {
            console.error('Failed to load profile:', err);
            setError('Failed to load profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await authAPI.updateProfile({
                first_name: firstName,
                last_name: lastName,
                bio: bio,
            });
            await loadProfile();
            setIsEditing(false);
        } catch (err) {
            console.error('Failed to update profile:', err);
            setError('Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        if (profile) {
            setFirstName(profile.user.first_name || '');
            setLastName(profile.user.last_name || '');
            setBio(profile.bio || '');
        }
        setIsEditing(false);
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
                    <Button className="mt-4" onClick={() => router.push('/')}>
                        Go Home
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            {/* Profile Header */}
            <Card className="p-8 mb-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    <Avatar className="w-24 h-24">
                        <AvatarFallback className="text-3xl">
                            {profile.username[0].toUpperCase()}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold">{profile.username}</h1>
                            <Badge variant="secondary" className="text-sm">
                                Level {profile.level}
                            </Badge>
                        </div>

                        {!isEditing ? (
                            <>
                                {(profile.user.first_name || profile.user.last_name) && (
                                    <p className="text-muted-foreground mb-3">
                                        {profile.user.first_name} {profile.user.last_name}
                                    </p>
                                )}
                                
                                <p className="text-sm text-muted-foreground mb-2">
                                    {profile.email}
                                </p>

                                {profile.bio && (
                                    <p className="text-sm mb-4">{profile.bio}</p>
                                )}
                            </>
                        ) : (
                            <div className="space-y-4 mt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="firstName">First Name</Label>
                                        <Input
                                            id="firstName"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            placeholder="First name"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="lastName">Last Name</Label>
                                        <Input
                                            id="lastName"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            placeholder="Last name"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="bio">Bio</Label>
                                    <Input
                                        id="bio"
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        placeholder="Tell us about yourself..."
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2">
                        {!isEditing ? (
                            <Button 
                                onClick={() => setIsEditing(true)}
                                className="gap-2"
                            >
                                <Edit2 className="w-4 h-4" />
                                Edit Profile
                            </Button>
                        ) : (
                            <>
                                <Button 
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="gap-2"
                                >
                                    {isSaving ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}
                                    Save
                                </Button>
                                <Button 
                                    onClick={handleCancel}
                                    variant="outline"
                                    disabled={isSaving}
                                    className="gap-2"
                                >
                                    <X className="w-4 h-4" />
                                    Cancel
                                </Button>
                            </>
                        )}
                    </div>
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
                            <p className="text-2xl font-bold">{profile.total_workouts}</p>
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
                            <p className="text-2xl font-bold">{profile.total_points}</p>
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
                            <p className="text-2xl font-bold">{profile.current_streak}</p>
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
                            <p className="text-2xl font-bold">{profile.longest_streak}</p>
                            <p className="text-xs text-muted-foreground">Best Streak</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
