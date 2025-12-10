'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { authAPI } from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Dumbbell, Zap, TrendingUp, Trophy, History, Loader2, Flame } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user, setTokens, setUser, setLoading } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadUserProfile();
    }
  }, [isAuthenticated]);

  const loadUserProfile = async () => {
    try {
      const data = await authAPI.getProfile();
      setProfile(data);
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);
    setLoading(true);

    try {
      const tokenResponse = await authAPI.login(loginForm.username, loginForm.password);
      setTokens(tokenResponse.access, tokenResponse.refresh);
      const profileResponse = await authAPI.getProfile();
      setUser(profileResponse.user);
    } catch (err: any) {
      setError('Invalid credentials.');
    } finally {
      setIsLoggingIn(false);
      setLoading(false);
    }
  };

  // Not logged in - show compact login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
        <Card className="w-full max-w-md p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Dumbbell className="w-10 h-10 text-primary" />
              <h1 className="text-3xl font-bold">FitQuest</h1>
            </div>
            <p className="text-muted-foreground">Track workouts. Level up. Get stronger.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                required
                disabled={isLoggingIn}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                required
                disabled={isLoggingIn}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoggingIn}>
              {isLoggingIn ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Logging in...</> : 'Login'}
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">No account? </span>
            <Button variant="link" className="p-0 h-auto" onClick={() => router.push('/auth/register')}>
              Sign up
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Logged in - show dashboard
  const xpProgress = profile ? ((profile.total_points % 100) / 100) * 100 : 0;
  const nextLevel = profile ? profile.level + 1 : 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">FitQuest</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome, {profile?.username || user?.username}</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid gap-6">
          {/* Stats Card */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">Your Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Trophy className="w-4 h-4" />
                  <span>Level</span>
                </div>
                <div className="text-3xl font-bold">{profile?.level || 1}</div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{profile?.total_points || 0} XP</span>
                    <span>Next: {nextLevel * 100} XP</span>
                  </div>
                  <Progress value={xpProgress} className="h-2" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Flame className="w-4 h-4" />
                  <span>Current Streak</span>
                </div>
                <div className="text-3xl font-bold">{profile?.current_streak || 0} days</div>
                <div className="text-sm text-muted-foreground">
                  Best: {profile?.longest_streak || 0} days
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>Total Workouts</span>
                </div>
                <div className="text-3xl font-bold">{profile?.total_workouts || 0}</div>
                <div className="text-sm text-muted-foreground">
                  Keep it up!
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              size="lg"
              className="h-24 text-lg gap-3 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-500"
              onClick={() => router.push('/generator/muscle-selection')}
            >
              <Zap className="w-6 h-6" />
              Generate New Workout
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="h-24 text-lg gap-3"
              onClick={() => router.push('/workout/active')}
            >
              <History className="w-6 h-6" />
              View Last Workout
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="h-24 text-lg gap-3"
              onClick={() => alert('Achievements coming soon!')}
            >
              <Trophy className="w-6 h-6" />
              My Achievements
            </Button>
          </div>

          {/* Recent Activity Placeholder */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            <div className="text-center py-8 text-muted-foreground">
              <p>No recent workouts yet.</p>
              <p className="text-sm mt-2">Generate your first workout to get started!</p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
