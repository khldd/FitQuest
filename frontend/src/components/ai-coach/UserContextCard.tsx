'use client';

import { useChatStore } from '@/store/chat-store';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, Flame, Trophy, Dumbbell, Calendar } from 'lucide-react';

export default function UserContextCard() {
  const { userContext } = useChatStore();
  
  if (!userContext) return null;
  
  // Calculate level progress (assuming 100 points per level)
  const pointsInLevel = userContext.total_points % 1000;
  const levelProgress = (pointsInLevel / 1000) * 100;
  
  return (
    <Card className="p-4 bg-gradient-to-br from-card to-muted/50">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
          <Dumbbell className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-sm">Coach knows about you</h3>
          <p className="text-xs text-muted-foreground">@{userContext.username}</p>
        </div>
      </div>
      
      {/* Level Progress */}
      <div className="mb-4 p-3 rounded-lg bg-background/50">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium">Level {userContext.level}</span>
          <span className="text-xs text-muted-foreground">{userContext.total_points} XP</span>
        </div>
        <Progress value={levelProgress} className="h-2" />
      </div>
      
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-background/50">
          <Target className="h-4 w-4 text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Goal</p>
            <p className="font-medium capitalize text-xs">
              {userContext.fitness_goal?.replace('_', ' ') || 'Not set'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 p-2 rounded-lg bg-background/50">
          <TrendingUp className="h-4 w-4 text-green-500" />
          <div>
            <p className="text-xs text-muted-foreground">Level</p>
            <p className="font-medium text-xs">{userContext.level}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 p-2 rounded-lg bg-background/50">
          <Flame className="h-4 w-4 text-orange-500" />
          <div>
            <p className="text-xs text-muted-foreground">Streak</p>
            <p className="font-medium text-xs">{userContext.current_streak} days 🔥</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 p-2 rounded-lg bg-background/50">
          <Trophy className="h-4 w-4 text-yellow-500" />
          <div>
            <p className="text-xs text-muted-foreground">Workouts</p>
            <p className="font-medium text-xs">{userContext.total_workouts}</p>
          </div>
        </div>
      </div>
      
      {userContext.favorite_muscle_groups && userContext.favorite_muscle_groups.length > 0 && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <Dumbbell className="h-3 w-3" />
            Favorite Muscles
          </p>
          <div className="flex flex-wrap gap-1">
            {userContext.favorite_muscle_groups.slice(0, 5).map((muscle, index) => (
              <span
                key={index}
                className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full capitalize"
              >
                {muscle}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {userContext.recent_workouts && userContext.recent_workouts.length > 0 && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Recent Activity
          </p>
          <div className="space-y-1">
            {userContext.recent_workouts.slice(0, 2).map((workout: any, index: number) => (
              <div 
                key={index}
                className="text-xs p-2 rounded bg-background/50 flex items-center justify-between"
              >
                <span className="capitalize truncate">
                  {workout.muscles_targeted?.join(', ') || 'Workout'}
                </span>
                <span className="text-muted-foreground">
                  {workout.duration}m
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
