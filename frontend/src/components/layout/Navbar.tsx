'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';
import {
    Home,
    Dumbbell,
    History,
    Calendar,
    User,
    LogOut,
    Menu,
    X,
    Zap
} from 'lucide-react';

const NAV_LINKS = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/generator/muscle-selection', label: 'Generate', icon: Dumbbell },
    { href: '/history', label: 'History', icon: History },
    { href: '/calendar', label: 'Calendar', icon: Calendar },
];

export function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { isAuthenticated, user, logout, _hasHydrated } = useAuthStore();
    const [mobileOpen, setMobileOpen] = useState(false);

    // Don't show navbar on auth pages
    if (pathname?.startsWith('/auth')) {
        return null;
    }

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="p-2 bg-primary/20 rounded-xl group-hover:bg-primary/30 transition-colors">
                            <Zap className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-bold text-xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            FitQuest
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {NAV_LINKS.map((link) => {
                            const isActive = pathname === link.href ||
                                (link.href !== '/' && pathname?.startsWith(link.href));
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`
                                        flex items-center gap-2 px-4 py-2 rounded-lg transition-all
                                        ${isActive
                                            ? 'bg-primary/20 text-primary'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                                        }
                                    `}
                                >
                                    <link.icon className="w-4 h-4" />
                                    <span className="text-sm font-medium">{link.label}</span>
                                </Link>
                            );
                        })}
                    </div>

                    {/* User Menu (Desktop) */}
                    <div className="hidden md:flex items-center gap-4">
                        {!_hasHydrated ? (
                            // Loading skeleton while hydrating
                            <div className="w-24 h-8 bg-white/5 rounded-lg animate-pulse" />
                        ) : isAuthenticated ? (
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full">
                                    <User className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm">{user?.username || 'User'}</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleLogout}
                                    className="gap-2 text-muted-foreground hover:text-foreground"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </Button>
                            </div>
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
                        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="md:hidden border-t border-white/5 bg-background/95 backdrop-blur-xl">
                    <div className="px-4 py-4 space-y-2">
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
                                            ? 'bg-primary/20 text-primary'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                                        }
                                    `}
                                >
                                    <link.icon className="w-5 h-5" />
                                    <span className="font-medium">{link.label}</span>
                                </Link>
                            );
                        })}

                        <div className="pt-4 border-t border-white/10">
                            {!_hasHydrated ? (
                                <div className="w-full h-10 bg-white/5 rounded-lg animate-pulse" />
                            ) : isAuthenticated ? (
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start gap-3"
                                    onClick={() => {
                                        handleLogout();
                                        setMobileOpen(false);
                                    }}
                                >
                                    <LogOut className="w-5 h-5" />
                                    Logout
                                </Button>
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
                                        className="w-full"
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
