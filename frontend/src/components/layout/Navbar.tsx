'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/auth-store';
import { authAPI } from '@/lib/api-client';
import {
    Home,
    Dumbbell,
    History,
    Calendar,
    User,
    LogOut,
    Menu,
    X,
    Zap,
    BarChart3,
    Apple,
    Users,
    Settings,
    UserCircle,
    Bot,
    Trophy,
    Flame,
    Star,
    Sparkles
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const NAV_LINKS = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/generator/muscle-selection', label: 'Generate', icon: Dumbbell, highlight: true },
    { href: '/achievements', label: 'Achievements', icon: Trophy },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/history', label: 'History', icon: History },
    { href: '/nutrition', label: 'Nutrition', icon: Apple },
    { href: '/coach', label: 'AI Coach', icon: Bot },
];

export function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { isAuthenticated, user, logout, _hasHydrated } = useAuthStore();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profile, setProfile] = useState<any>(null);

    // Load user profile for level/XP display
    useEffect(() => {
        if (isAuthenticated && _hasHydrated) {
            loadProfile();
        }
    }, [isAuthenticated, _hasHydrated]);

    const loadProfile = async () => {
        try {
            const data = await authAPI.getProfile();
            setProfile(data);
        } catch (err) {
            console.error('Failed to load profile:', err);
        }
    };

    // Don't show navbar on auth pages
    if (pathname?.startsWith('/auth')) {
        return null;
    }

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    // Calculate XP progress to next level
    const getXPProgress = () => {
        if (!profile) return 0;
        const xpForNextLevel = profile.level * 100;
        const xpInCurrentLevel = profile.total_points % 100;
        return (xpInCurrentLevel / 100) * 100;
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/10">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg group-hover:shadow-lg group-hover:shadow-purple-500/50 transition-all">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-xl text-white">
                            FitQuest
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        {NAV_LINKS.map((link) => {
                            const isActive = pathname === link.href ||
                                (link.href !== '/' && pathname?.startsWith(link.href));
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`
                                        flex items-center gap-2 px-3 py-2 rounded-lg transition-all font-medium text-sm
                                        ${isActive
                                            ? 'text-white bg-white/10'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }
                                    `}
                                >
                                    <link.icon className="w-4 h-4" />
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* User Menu (Desktop) */}
                    <div className="hidden md:flex items-center gap-3">
                        {!_hasHydrated ? (
                            <div className="w-24 h-10 bg-white/5 rounded-lg animate-pulse" />
                        ) : isAuthenticated ? (
                            <>
                                {/* Quick Generate Button */}
                                <Button
                                    onClick={() => router.push('/generator/muscle-selection')}
                                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 font-semibold"
                                    size="sm"
                                >
                                    <Zap className="w-4 h-4 mr-2" />
                                    Generate
                                </Button>

                                {/* Level Display */}
                                {profile && (
                                    <div className="flex items-center gap-3 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                                        <div className="flex items-center gap-1.5">
                                            <Star className="w-4 h-4 text-yellow-400" />
                                            <span className="text-sm font-semibold text-white">Level {profile.level}</span>
                                        </div>
                                        {profile.current_streak > 0 && (
                                            <>
                                                <div className="w-px h-4 bg-white/20" />
                                                <div className="flex items-center gap-1">
                                                    <Flame className="w-4 h-4 text-orange-400" />
                                                    <span className="text-sm font-semibold text-white">{profile.current_streak}</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                                
                                {/* User Menu */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                                            <User className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm font-medium text-white">{user?.username}</span>
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                        <DropdownMenuLabel>
                                            {profile && (
                                                <div className="flex flex-col gap-1">
                                                    <span>{user?.username}</span>
                                                    <span className="text-xs text-muted-foreground font-normal">
                                                        {profile.total_points} XP • {profile.total_workouts} Workouts
                                                    </span>
                                                </div>
                                            )}
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => router.push('/profile')}>
                                            <UserCircle className="w-4 h-4 mr-2" />
                                            Profile
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => router.push('/settings')}>
                                            <Settings className="w-4 h-4 mr-2" />
                                            Settings
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={handleLogout} className="text-red-400">
                                            <LogOut className="w-4 h-4 mr-2" />
                                            Logout
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.push('/auth/login')}
                                >
                                    Login
                                </Button>
                                <Button
                                    size="sm"
                                    className="bg-gradient-to-r from-purple-500 to-pink-500"
                                    onClick={() => router.push('/auth/register')}
                                >
                                    Sign Up
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 rounded-lg hover:bg-white/5"
                        onClick={() => setMobileOpen(!mobileOpen)}
                    >
                        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="lg:hidden border-t border-white/10 bg-background/98 backdrop-blur-2xl">
                    <div className="px-4 py-6 space-y-3 max-h-[calc(100vh-5rem)] overflow-y-auto">
                        {/* User Profile in Mobile */}
                        {isAuthenticated && profile && (
                            <div className="mb-4 p-4 bg-gradient-to-br from-white/10 to-white/5 rounded-xl border border-white/10">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-lg">
                                        <User className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold">{user?.username}</p>
                                        <p className="text-xs text-muted-foreground">{profile.total_points} XP</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <Star className="w-4 h-4 text-yellow-400" />
                                        <span className="text-sm font-semibold">Level {profile.level}</span>
                                    </div>
                                    {profile.current_streak > 0 && (
                                        <div className="flex items-center gap-1.5">
                                            <Flame className="w-4 h-4 text-orange-400" />
                                            <span className="text-sm font-semibold">{profile.current_streak} day streak</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        {NAV_LINKS.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={`
                                        flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                                        ${isActive
                                            ? 'bg-white/10 text-white'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }
                                    `}
                                >
                                    <link.icon className="w-5 h-5" />
                                    <span className="font-medium">{link.label}</span>
                                </Link>
                            );
                        })}

                        <div className="pt-3 border-t border-white/10 space-y-2">
                            {isAuthenticated ? (
                                <>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start gap-3 text-gray-400 hover:text-white"
                                        onClick={() => {
                                            router.push('/settings');
                                            setMobileOpen(false);
                                        }}
                                    >
                                        <Settings className="w-4 h-4" />
                                        Settings
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start gap-3 text-red-400 hover:text-red-300"
                                        onClick={() => {
                                            handleLogout();
                                            setMobileOpen(false);
                                        }}
                                    >
                                        <LogOut className="w-4 h-4" />
                                        Logout
                                    </Button>
                                </>
                            ) : (
                                <div className="space-y-2">
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => {
                                            router.push('/auth/login');
                                            setMobileOpen(false);
                                        }}
                                    >
                                        Login
                                    </Button>
                                    <Button
                                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
                                        onClick={() => {
                                            router.push('/auth/register');
                                            setMobileOpen(false);
                                        }}
                                    >
                                        Sign Up
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}