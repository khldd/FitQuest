'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
    LayoutDashboard, 
    Dumbbell, 
    Trophy, 
    BarChart3, 
    History, 
    Apple, 
    Bot, 
    Users,
    Menu, 
    X, 
    LogOut, 
    User,
    Settings,
    ChevronRight,
    Zap,
    Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/auth-store';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { authAPI } from '@/lib/api-client';

interface NavItem {
    href: string;
    label: string;
    icon: React.ElementType;
    badge?: string;
}

const NAV_ITEMS: NavItem[] = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/generator/muscle-selection', label: 'Workout Generator', icon: Dumbbell },
    { href: '/programs', label: 'Programs', icon: Calendar, badge: 'New' },
    { href: '/achievements', label: 'Achievements', icon: Trophy },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/history', label: 'History', icon: History },
    { href: '/nutrition', label: 'Nutrition', icon: Apple },
    { href: '/social', label: 'Community', icon: Users },
    { href: '/coach', label: 'AI Coach', icon: Bot, badge: 'Beta' },
];

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user, logout, isAuthenticated, _hasHydrated } = useAuthStore();
    const [profile, setProfile] = useState<any>(null);

    // Initial profile load
    useEffect(() => {
        if (isAuthenticated && _hasHydrated) {
            authAPI.getProfile().then(setProfile).catch(console.error);
        }
    }, [isAuthenticated, _hasHydrated]);

    // Skip shell for auth pages
    if (pathname?.startsWith('/auth')) {
        return <>{children}</>;
    }

    const handleLogout = () => {
        logout();
        router.push('/auth/login');
    };

    return (
        <div className="min-h-screen bg-gray-50/50 flex flex-col md:flex-row">
            {/* Mobile Header */}
            <div className="md:hidden h-16 bg-white border-b px-4 flex items-center justify-between sticky top-0 z-40">
                <div className="flex items-center gap-2 font-bold text-lg tracking-tight text-indigo-600">
                    <Zap className="w-5 h-5 fill-current" />
                    <span>FitQuest</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
                    {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
            </div>

            {/* Sidebar Overlay (Mobile) */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/20 z-30 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-100 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:h-screen sticky top-0",
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="h-full flex flex-col">
                    {/* Logo Area */}
                    <div className="h-16 flex items-center px-6 border-b border-gray-50">
                        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-indigo-600">
                            <Zap className="w-6 h-6 fill-current" />
                            <span>FitQuest</span>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                        {NAV_ITEMS.map((item) => {
                            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 group",
                                        isActive 
                                            ? "bg-indigo-50 text-indigo-700" 
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    )}
                                >
                                    <item.icon className={cn(
                                        "w-5 h-5 transition-colors",
                                        isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-500"
                                    )} />
                                    <span className="flex-1">{item.label}</span>
                                    {item.badge && (
                                        <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-indigo-100 text-indigo-700 rounded-full uppercase tracking-wider">
                                            {item.badge}
                                        </span>
                                    )}
                                    {isActive && <ChevronRight className="w-4 h-4 text-indigo-400" />}
                                </Link>
                            );
                        })}
                    </div>

                    {/* User Profile Footer */}
                    <div className="p-4 border-t border-gray-50">
                        {isAuthenticated && user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-3 w-full p-2 hover:bg-gray-50 rounded-lg transition-colors text-left">
                                        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold border border-indigo-200">
                                            {user.username?.[0]?.toUpperCase()}
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="text-sm font-medium text-gray-900 truncate">{user.username}</p>
                                            <p className="text-xs text-gray-500 truncate">Level {profile?.level || 1}</p>
                                        </div>
                                        <Settings className="w-4 h-4 text-gray-400" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 mb-2">
                                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => router.push('/settings')}>
                                        Settings
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                                        Log out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="grid gap-2">
                                <Button size="sm" variant="outline" className="w-full" asChild>
                                    <Link href="/auth/login">Log in</Link>
                                </Button>
                                <Button size="sm" className="w-full" asChild>
                                    <Link href="/auth/register">Sign up</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 overflow-y-auto h-[calc(100vh-4rem)] md:h-screen bg-gray-50/50">
                 {/* Top Bar for Desktop - Optional actions or breadcrumbs could go here */}
                 {isAuthenticated && <div className="hidden md:flex h-16 items-center justify-between px-8 border-b border-gray-200 bg-white sticky top-0 z-20">
                    <h1 className="text-xl font-semibold text-gray-800 capitalize">
                        {pathname === '/' ? 'Dashboard' : pathname?.split('/')[1]?.replace('-', ' ')}
                    </h1>
                     <div className="flex items-center gap-4">
                         {/* Quick Actions */}
                         <Button size="sm" variant="default" className="shadow-sm" onClick={() => router.push('/generator/muscle-selection')}>
                            <Dumbbell className="w-4 h-4 mr-2" />
                            New Workout
                         </Button>
                     </div>
                 </div>}

                <div className="p-4 md:p-8 max-w-7xl mx-auto dark:text-gray-900">
                    {children}
                </div>
            </main>
        </div>
    );
}
