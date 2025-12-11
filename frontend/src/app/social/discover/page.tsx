'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Users, Loader2, ArrowLeft } from 'lucide-react';
import { socialAPI } from '@/lib/api-client';

interface User {
    id: number;
    username: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
    level: number;
}

export default function DiscoverPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const response = await socialAPI.searchUsers(query);
            // Handle paginated response or plain array
            const users = response.results || response;
            setSearchResults(Array.isArray(users) ? users : []);
        } catch (err) {
            console.error('Search failed:', err);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Users className="w-8 h-8 text-primary" />
                    Find Friends
                </h1>
            </div>

            {/* Search Bar */}
            <Card className="p-6 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Search for users by name or username..."
                        className="pl-10 h-12 text-lg"
                    />
                </div>
                {isSearching && (
                    <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                )}
            </Card>

            {/* Search Results */}
            {searchQuery.length >= 2 && !isSearching && (
                <div className="space-y-3">
                    {searchResults.length === 0 ? (
                        <Card className="p-8 text-center">
                            <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-muted-foreground">
                                No users found matching &quot;{searchQuery}&quot;
                            </p>
                        </Card>
                    ) : (
                        searchResults.map((user) => (
                            <Card 
                                key={user.id}
                                className="p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                                onClick={() => router.push(`/social/profile/${user.id}`)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="w-12 h-12">
                                            <AvatarFallback className="text-lg">
                                                {user.username[0].toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="font-semibold">{user.username}</p>
                                                <Badge variant="secondary" className="text-xs">
                                                    Lvl {user.level}
                                                </Badge>
                                            </div>
                                            {(user.first_name || user.last_name) && (
                                                <p className="text-sm text-muted-foreground">
                                                    {user.first_name} {user.last_name}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        View Profile
                                    </Button>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            )}

            {/* Initial State */}
            {searchQuery.length < 2 && (
                <Card className="p-12 text-center">
                    <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">Discover New Friends</h3>
                    <p className="text-muted-foreground mb-6">
                        Search for users by name or username to connect with fellow fitness enthusiasts
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                        <Badge variant="outline" className="text-sm py-2 px-4">💪 Workout Partners</Badge>
                        <Badge variant="outline" className="text-sm py-2 px-4">🏆 Top Athletes</Badge>
                        <Badge variant="outline" className="text-sm py-2 px-4">🔥 Fitness Friends</Badge>
                    </div>
                </Card>
            )}
        </div>
    );
}
