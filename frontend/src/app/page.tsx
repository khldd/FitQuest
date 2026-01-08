'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { authAPI, workoutAPI, achievementsAPI, programsAPI } from '@/lib/api-client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Dumbbell, 
  CalendarDays,
  Target,
  Trophy,
  Activity,
  Zap,
  Apple,
  Users,
  Bot,
  Calendar,
  Play,
  ChevronRight
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, setTokens, setUser, setLoading } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<any[]>([]);
  const [recentAchievements, setRecentAchievements] = useState<any[]>([]);
  const [activeEnrollment, setActiveEnrollment] = useState<any>(null);
  const [featuredPrograms, setFeaturedPrograms] = useState<any[]>([]);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  const loadDashboardData = async () => {
    // Batch all API calls with Promise.all for better performance
    try {
      const [profileData, workoutsResponse, achievementsResponse, featuredResponse] = await Promise.all([
        authAPI.getProfile(),
        workoutAPI.getHistory({ ordering: '-workout_date' }),
        achievementsAPI.getUnlockedAchievements({ ordering: '-unlocked_at' }),
        programsAPI.getFeatured(),
      ]);

      setProfile(profileData);

      // Handle paginated responses
      const workouts = workoutsResponse.results || workoutsResponse;
      setRecentWorkouts(Array.isArray(workouts) ? workouts.slice(0, 3) : []);

      const achievements = achievementsResponse.results || achievementsResponse;
      setRecentAchievements(Array.isArray(achievements) ? achievements.slice(0, 3) : []);

      setFeaturedPrograms(Array.isArray(featuredResponse) ? featuredResponse.slice(0, 2) : []);

      // Try to get active enrollment (may not exist)
      try {
        const enrollment = await programsAPI.getActiveEnrollment();
        setActiveEnrollment(enrollment);
      } catch {
        setActiveEnrollment(null);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
        <Card className="w-full max-w-md shadow-sm border-gray-200">
          <CardHeader className="space-y-1 text-center pb-2">
            <div className="flex justify-center mb-4">
                <div className="p-3 bg-indigo-50 rounded-xl">
                  <Zap className="w-8 h-8 text-indigo-600 fill-current" />
                </div>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">Sign in to fitQuest</CardTitle>
            <p className="text-sm text-gray-500">Welcome back! Please enter your details.</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium h-10" disabled={isLoggingIn}>
                {isLoggingIn ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
            <div className="text-center text-sm pt-2">
              <span className="text-gray-500">Don't have an account? </span>
              <Button variant="link" className="p-0 h-auto text-indigo-600 hover:text-indigo-700 font-medium" onClick={() => router.push('/auth/register')}>
                Sign up
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {getTimeGreeting()}, {profile?.user?.username || 'Guest'}
          </h1>
          <p className="text-gray-500 mt-1">Here's what's happening with your fitness journey today.</p>
        </div>
        <Button onClick={() => router.push('/generator/muscle-selection')} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow transition-all font-medium">
            Generate Workout <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow duration-200 border-gray-100">
            <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <Activity className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500">Level {profile?.level || 1}</p>
                    <h3 className="text-2xl font-bold text-gray-900">{profile?.total_points || 0} XP</h3>
                </div>
            </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow duration-200 border-gray-100">
            <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                    <Target className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500">Current Streak</p>
                    <h3 className="text-2xl font-bold text-gray-900">{profile?.current_streak || 0} Days</h3>
                </div>
            </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow duration-200 border-gray-100">
            <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                    <Trophy className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500">Workouts Completed</p>
                    <h3 className="text-2xl font-bold text-gray-900">{profile?.total_workouts || 0}</h3>
                </div>
            </CardContent>
        </Card>
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Button variant="outline" className="h-24 flex flex-col gap-2 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all border-gray-200" onClick={() => router.push('/programs')}>
            <Calendar className="w-6 h-6" />
            <span className="font-semibold">Programs</span>
        </Button>
        <Button variant="outline" className="h-24 flex flex-col gap-2 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all border-gray-200" onClick={() => router.push('/nutrition')}>
            <Apple className="w-6 h-6" />
            <span className="font-semibold">Nutrition</span>
        </Button>
        <Button variant="outline" className="h-24 flex flex-col gap-2 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all border-gray-200" onClick={() => router.push('/social')}>
            <Users className="w-6 h-6" />
            <span className="font-semibold">Community</span>
        </Button>
        <Button variant="outline" className="h-24 flex flex-col gap-2 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all border-gray-200" onClick={() => router.push('/coach')}>
            <Bot className="w-6 h-6" />
            <span className="font-semibold">AI Coach</span>
        </Button>
      </div>

      {/* Active Program or Featured Programs */}
      {activeEnrollment ? (
        <Card className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-200">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="text-4xl p-3 bg-white rounded-xl shadow-sm">
                  {activeEnrollment.program?.icon || '📋'}
                </div>
                <div>
                  <p className="text-sm text-indigo-600 font-medium">Active Program</p>
                  <h3 className="text-xl font-bold text-gray-900">{activeEnrollment.program?.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Week {activeEnrollment.current_week} • Day {activeEnrollment.current_day} • {activeEnrollment.completion_percentage}% complete
                  </p>
                </div>
              </div>
              <Button onClick={() => router.push(`/programs/${activeEnrollment.program?.id}`)} className="bg-indigo-600 hover:bg-indigo-700">
                <Play className="w-4 h-4 mr-2" />
                Continue
              </Button>
            </div>
            <div className="mt-4">
              <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-500" 
                  style={{ width: `${activeEnrollment.completion_percentage}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : featuredPrograms.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              Featured Programs
            </h2>
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-indigo-600" onClick={() => router.push('/programs')}>
              Browse all <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredPrograms.map((program: any) => (
              <Card 
                key={program.id} 
                className="hover:shadow-md transition-all cursor-pointer border-gray-100 hover:border-indigo-200"
                onClick={() => router.push(`/programs/${program.id}`)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl p-2 rounded-lg" style={{ backgroundColor: program.color + '20' }}>
                      {program.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs capitalize">{program.difficulty}</Badge>
                        <Badge variant="secondary" className="text-xs">{program.duration_weeks} weeks</Badge>
                      </div>
                      <h4 className="font-semibold text-gray-900 truncate">{program.name}</h4>
                      <p className="text-sm text-gray-500 line-clamp-1 mt-1">{program.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-indigo-600" onClick={() => router.push('/history')}>View all</Button>
            </div>
            
            <Card className="border-gray-100 overflow-hidden">
                <div className="divide-y divide-gray-100">
                    {recentWorkouts.length > 0 ? recentWorkouts.map((workout: any) => (
                        <div key={workout.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-4 group cursor-pointer" onClick={() => router.push(`/history`)}>
                           <div className="p-2.5 bg-gray-100 rounded-lg text-gray-600 group-hover:bg-white group-hover:text-indigo-600 group-hover:shadow-sm transition-all">
                                <Dumbbell className="w-5 h-5" />
                           </div>
                           <div className="flex-1">
                                <h4 className="font-medium text-gray-900 capitalize flex items-center gap-2">
                                    {(workout.muscles_targeted || []).join(', ')}
                                    <Badge variant="secondary" className="text-[10px] font-normal text-gray-500 bg-gray-100 hover:bg-gray-100">{workout.goal}</Badge>
                                </h4>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    {workout.exercises_completed?.length || 0} Exercises • {new Date(workout.workout_date).toLocaleDateString()}
                                </p>
                           </div>
                           <div className="text-right">
                                <span className="text-sm font-medium text-green-600">+{workout.points_earned} XP</span>
                           </div>
                        </div>
                    )) : (
                        <div className="p-8 text-center text-gray-500">
                            <CalendarDays className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            <p>No workouts recorded yet.</p>
                        </div>
                    )}
                </div>
            </Card>
        </div>

        {/* Recent Achievements - Side Panel */}
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Latest Achievements</h2>
                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-indigo-600" onClick={() => router.push('/achievements')}>View all</Button>
            </div>
             <Card className="border-gray-100">
                <CardContent className="p-0">
                    {recentAchievements.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {recentAchievements.map((item: any) => (
                                <div key={item.id} className="p-4 flex gap-3">
                                    <div className="text-2xl filter grayscale opacity-80">{item.achievement.icon}</div>
                                    <div>
                                        <p className="font-medium text-sm text-gray-900">{item.achievement.name}</p>
                                        <p className="text-xs text-gray-500 line-clamp-1">{item.achievement.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            <Trophy className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">Start working out to earn badges!</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
